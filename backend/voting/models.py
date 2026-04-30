from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


class Election(models.Model):
    STATUS_PENDING = 'pending'
    STATUS_ACTIVE = 'active'
    STATUS_CLOSED = 'closed'
    STATUS_CHOICES = [
        (STATUS_PENDING, 'Pending'),
        (STATUS_ACTIVE, 'Active'),
        (STATUS_CLOSED, 'Closed'),
    ]

    title = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    start_time = models.DateTimeField(null=True, blank=True)
    end_time = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default=STATUS_PENDING)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

    def is_active(self):
        if self.status != self.STATUS_ACTIVE:
            return False
        if self.end_time and timezone.now() > self.end_time:
            return False
        return True

    def has_ended(self):
        if self.status == self.STATUS_CLOSED:
            return True
        if self.end_time and timezone.now() > self.end_time:
            return True
        return False


class Candidate(models.Model):
    name = models.CharField(max_length=100)
    party = models.CharField(max_length=100)
    bio = models.TextField(blank=True)
    election = models.ForeignKey(Election, on_delete=models.CASCADE, related_name='candidates')
    photo_url = models.URLField(blank=True)

    def __str__(self):
        return self.name


class Vote(models.Model):
    voter = models.ForeignKey(User, on_delete=models.CASCADE)
    candidate = models.ForeignKey(Candidate, on_delete=models.CASCADE)
    election = models.ForeignKey(Election, on_delete=models.CASCADE)
    ip_address = models.CharField(max_length=45, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('voter', 'election')

    def __str__(self):
        return f"{self.voter.username} -> {self.candidate.name} ({self.election.title})"


class SuspiciousVoteLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    election = models.ForeignKey(Election, on_delete=models.CASCADE)
    candidate = models.ForeignKey(Candidate, on_delete=models.CASCADE)
    ip_address = models.CharField(max_length=45, blank=True)
    reason = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Suspicious vote by {self.user.username} in {self.election.title}: {self.reason}"


class AccountBlock(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='block')
    blocked_until = models.DateTimeField(null=True, blank=True)
    reason = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def is_blocked(self):
        return self.blocked_until and timezone.now() < self.blocked_until

    def __str__(self):
        return f"{self.user.username} blocked until {self.blocked_until}"
class LoginActivity(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    login_time = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)

    def __str__(self):
        return f"{self.user.username} - {self.login_time}"