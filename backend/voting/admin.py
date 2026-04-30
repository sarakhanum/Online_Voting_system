from django.contrib import admin
from .models import Election, Candidate, Vote, SuspiciousVoteLog, AccountBlock

admin.site.register(Election)
admin.site.register(Candidate)
admin.site.register(Vote)
admin.site.register(SuspiciousVoteLog)
admin.site.register(AccountBlock)
