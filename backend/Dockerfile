# Use the official Python image as the base image
FROM python:3.12-slim

# Set environment variables to prevent .pyc files and buffering issues
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set the working directory inside the container
WORKDIR /app

# Install dependencies for building and PostgreSQL client
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    netcat-openbsd \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements file and install dependencies
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code into the container
COPY . /app/

# Create necessary directories for media and static files
RUN mkdir -p /app/media /app/staticfiles

# Expose port 8000 for Gunicorn
EXPOSE 8000

# Use Gunicorn to run the Django application
CMD ["gunicorn", "ecommerce.wsgi:application", "--workers", "3", "--bind", "0.0.0.0:8000"]