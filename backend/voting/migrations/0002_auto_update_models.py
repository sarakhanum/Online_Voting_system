from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        ('voting', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='election',
            name='is_active',
        ),
        migrations.AddField(
            model_name='election',
            name='created_at',
            field=models.DateTimeField(auto_now_add=True, default=django.utils.timezone.now),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='election',
            name='description',
            field=models.TextField(blank=True, default=''),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='election',
            name='end_time',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='election',
            name='start_time',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='election',
            name='status',
            field=models.CharField(choices=[('pending', 'Pending'), ('active', 'Active'), ('closed', 'Closed')], default='pending', max_length=10),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='candidate',
            name='bio',
            field=models.TextField(blank=True, default=''),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='candidate',
            name='photo_url',
            field=models.URLField(blank=True, default=''),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='vote',
            name='created_at',
            field=models.DateTimeField(auto_now_add=True, default=django.utils.timezone.now),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='vote',
            name='ip_address',
            field=models.CharField(blank=True, default='', max_length=45),
            preserve_default=False,
        ),
        migrations.CreateModel(
            name='AccountBlock',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('blocked_until', models.DateTimeField(blank=True, null=True)),
                ('reason', models.CharField(blank=True, max_length=255)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='block', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='SuspiciousVoteLog',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('ip_address', models.CharField(blank=True, max_length=45)),
                ('reason', models.CharField(max_length=255)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('candidate', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='voting.candidate')),
                ('election', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='voting.election')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
