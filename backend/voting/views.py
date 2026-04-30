from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from datetime import timedelta
from django.db.models import Count
from django.utils import timezone

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .models import (
    Candidate,
    Election,
    Vote,
    SuspiciousVoteLog,
    AccountBlock,
    LoginActivity   # ✅ ADDED
)

from .serializers import (
    UserSerializer,
    CandidateSerializer,
    ElectionSerializer,
    SuspiciousVoteLogSerializer,
)

# -------------------------
# UTILS
# -------------------------

def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        return x_forwarded_for.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR', '')


def get_block_for_user(user):
    try:
        return user.block
    except AccountBlock.DoesNotExist:
        return None


def clear_expired_block(user):
    block = get_block_for_user(user)
    if block and block.blocked_until and block.blocked_until <= timezone.now():
        user.is_active = True
        user.save(update_fields=['is_active'])
        block.delete()
        return True
    return False


# -------------------------
# AUTH
# -------------------------

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({'message': 'User registered successfully'})
    return Response(serializer.errors, status=400)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    username = request.data.get('username')
    password = request.data.get('password')

    print("🔐 LOGIN ATTEMPT:", username)

    user_obj = User.objects.filter(username=username).first()
    print("👤 USER FOUND:", user_obj)

    # 🔒 Check if blocked
    if user_obj:
        block = get_block_for_user(user_obj)

        if block and block.is_blocked():
            print("🚫 USER BLOCKED")
            return Response({
                'error': 'Your account is blocked due to suspicious activity.'
            }, status=403)

        # ⏳ Auto-unblock if expired
        if block and block.blocked_until and block.blocked_until <= timezone.now():
            clear_expired_block(user_obj)

    # 🔑 Authenticate
    user = authenticate(username=username, password=password)

    if user is None:
        print("❌ AUTH FAILED")
        return Response({'error': 'Invalid username or password'}, status=400)

    if not user.is_active:
        print("🚫 USER DISABLED")
        return Response({'error': 'Account is disabled'}, status=403)

    # ✅ Clear expired block again (safety)
    clear_expired_block(user)

    refresh = RefreshToken.for_user(user)

    print("✅ LOGIN SUCCESS")

    return Response({
        'message': 'Login successful',
        'user_id': user.id,
        'username': user.username,
        'is_staff': user.is_staff,
        'access_token': str(refresh.access_token),
        'refresh_token': str(refresh),
    })

# -------------------------
# USER
# -------------------------

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_elections(request):
    search = request.query_params.get('search', '').strip()
    elections = Election.objects.filter(status=Election.STATUS_ACTIVE)

    if search:
        elections = elections.filter(title__icontains=search)

    serializer = ElectionSerializer(elections.order_by('-created_at'), many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_candidates(request, election_id):
    election = Election.objects.filter(id=election_id, status=Election.STATUS_ACTIVE).first()
    if not election:
        return Response({'error': 'Election not found'}, status=400)

    candidates = Candidate.objects.filter(election=election)
    serializer = CandidateSerializer(candidates, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_vote_status(request, election_id):
    vote = Vote.objects.filter(voter=request.user, election_id=election_id).first()

    if vote:
        return Response({
            'already_voted': True,
            'candidate': vote.candidate.name,
            'party': vote.candidate.party,
        })

    return Response({'already_voted': False})


# -------------------------
# VOTING
# -------------------------

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cast_vote(request):

    block = get_block_for_user(request.user)
    if block and block.is_blocked():
        return Response({'error': 'Account is blocked'}, status=403)

    candidate_id = request.data.get('candidate')
    candidate = Candidate.objects.filter(id=candidate_id).first()

    if not candidate:
        return Response({'error': 'Candidate not found'}, status=400)

    election = candidate.election

    # 🚨 DUPLICATE VOTE
    if Vote.objects.filter(voter=request.user, election=election).exists():

        SuspiciousVoteLog.objects.create(
            user=request.user,
            election=election,
            candidate=candidate,
            ip_address=get_client_ip(request),
            reason='Duplicate vote attempt',
        )

        count = SuspiciousVoteLog.objects.filter(
            user=request.user,
            created_at__gte=timezone.now() - timedelta(hours=24)
        ).count()

        if count >= 3:
            AccountBlock.objects.update_or_create(
                user=request.user,
                defaults={
                    'blocked_until': timezone.now() + timedelta(hours=24),
                    'reason': 'Multiple vote attempts',
                }
            )

            request.user.is_active = False
            request.user.save()

            return Response({
                'blocked': True,
                'error': 'You are blocked for 24 hours due to suspicious activity.'
            }, status=403)

        return Response({'error': 'You already voted'}, status=400)

    Vote.objects.create(
        voter=request.user,
        candidate=candidate,
        election=election
    )

    return Response({'message': 'Vote successful'})


# -------------------------
# RESULTS
# -------------------------

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_results(request, election_id):
    election = Election.objects.filter(id=election_id).first()
    if not election:
        return Response({'error': 'Election not found'}, status=400)

    result_queryset = Candidate.objects.filter(election=election).annotate(
        total_votes=Count('vote')
    ).order_by('-total_votes')

    results = [
        {
            'id': c.id,
            'name': c.name,
            'party': c.party,
            'bio': c.bio,
            'total_votes': c.total_votes,
        }
        for c in result_queryset
    ]

    return Response({
        'election': ElectionSerializer(election).data,
        'results': results,
    })


# -------------------------
# ADMIN
# -------------------------

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def suspicious_activity(request):
    if not request.user.is_staff:
        return Response({'error': 'Admin access required'}, status=403)

    logs = SuspiciousVoteLog.objects.order_by('-created_at')[:20]
    serializer = SuspiciousVoteLogSerializer(logs, many=True)
    return Response(serializer.data)


# -------------------------
# AI CHAT
# -------------------------

@api_view(['POST'])
@permission_classes([AllowAny])
def ai_chat(request):
    message = str(request.data.get('message', '')).lower()

    if "vote" in message:
        reply = "You can vote once per election by selecting a candidate."
    elif "result" in message:
        reply = "Results show total votes for each candidate."
    elif "admin" in message:
        reply = "Admins can manage elections and monitor suspicious activity."
    else:
        reply = "Ask me about voting, elections, or results."

    return Response({'reply': reply})