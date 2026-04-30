from django.urls import path
from .views import (
    register,
    login_user,
    get_elections,
    get_candidates,
    check_vote_status,
    cast_vote,
    get_results,
    suspicious_activity,
    ai_chat,
)

urlpatterns = [
    # 🔐 AUTH
    path('register/', register),
    path('login/', login_user),

    # 🗳️ USER
    path('elections/', get_elections),
    path('candidates/<int:election_id>/', get_candidates),
    path('vote-status/<int:election_id>/', check_vote_status),
    path('vote/', cast_vote),
    path('results/<int:election_id>/', get_results),

    # 🔧 ADMIN
    path('admin/suspicious/', suspicious_activity),

    # 🤖 AI
    path('ai-chat/', ai_chat),
]