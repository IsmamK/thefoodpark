
# Alias for serving media files
Alias /backend/media/ /home/thefood1/public_html/backend/media/

<Directory /home/thefood1/public_html/backend/media>
	Require all granted
	Options -Indexes
</Directory>

# Alias for serving static files
Alias /backend/static/ /home/thefood1/public_html/backend/static/

<Directory /home/thefood1/public_html/backend/static>
	Require all granted
</Directory>

# Rewrite rules to ensure proper routing within the /backend/ context
RewriteEngine On

# Serve static files from /backend/static/ when requested
RewriteCond %{REQUEST_URI} ^/backend/static/
RewriteRule ^backend/static/(.*)$ /home/thefood1/public_html/backend/static/$1 [L]

# Serve media files from /backend/media/ when requested
RewriteCond %{REQUEST_URI} ^/backend/media/
RewriteRule ^backend/media/(.*)$ /home/thefood1/public_html/backend/media/$1 [L]

# Forward other requests to Django application
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^backend/(.*)$ /backend/$1 [PT,L]

# Redirect to HTTPS (if required)
RewriteCond %{HTTPS} off
RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

