# Generated by Django 4.2.11 on 2024-07-28 08:01

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='order',
            name='user',
        ),
        migrations.AddField(
            model_name='order',
            name='name',
            field=models.CharField(default='Ismam', max_length=255),
            preserve_default=False,
        ),
    ]
