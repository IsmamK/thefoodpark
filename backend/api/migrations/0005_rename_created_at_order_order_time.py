# Generated by Django 4.2.11 on 2024-08-01 01:30

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0004_alter_order_status'),
    ]

    operations = [
        migrations.RenameField(
            model_name='order',
            old_name='created_at',
            new_name='order_time',
        ),
    ]
