from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Candidate, Election, Vote, SuspiciousVoteLog,AccountBlock


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class ElectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Election
        fields = '__all__'


class CandidateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Candidate
        fields = '__all__'


class VoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vote
        fields = '__all__'


class SuspiciousVoteLogSerializer(serializers.ModelSerializer):
    user = serializers.CharField(source='user.username', read_only=True)
    election = serializers.CharField(source='election.title', read_only=True)
    candidate = serializers.CharField(source='candidate.name', read_only=True)

    class Meta:
        model = SuspiciousVoteLog
        fields = ['id', 'user', 'election', 'candidate', 'ip_address', 'reason', 'created_at']


class AccountBlockSerializer(serializers.ModelSerializer):
    class Meta:
        model = AccountBlock
        fields = ['user', 'blocked_until', 'reason', 'created_at']
