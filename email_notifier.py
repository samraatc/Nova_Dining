#!/usr/bin/env python3
"""
GitHub Actions Email Notifier Script
Sends email notifications for CI/CD pipeline status updates
"""

import os
import sys
import argparse
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime


def create_email_content(args):
    """Create email content based on deployment status"""
    
    if args.status == 'success':
        subject = f"✅ Deployment Success: {args.repository}"
        
        html_body = f"""
        <html>
        <body style="font-family: Arial, sans-serif;">
            <h2 style="color: #28a745;">🎉 Deployment Successful!</h2>
            
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px;">
                <h3>Deployment Details</h3>
                <ul>
                    <li><strong>Repository:</strong> {args.repository}</li>
                    <li><strong>Branch:</strong> {args.branch}</li>
                    <li><strong>Environment:</strong> {args.environment}</li>
                    <li><strong>Commit:</strong> {args.commit[:7]}</li>
                    <li><strong>Triggered by:</strong> {args.actor}</li>
                    <li><strong>Workflow:</strong> {args.workflow}</li>
                    <li><strong>Timestamp:</strong> {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} UTC</li>
                </ul>
            </div>
            
            <div style="margin-top: 20px;">
                <h3>Links</h3>
                <p>
                    <a href="{args.deployment_url}" style="color: #007bff; text-decoration: none;">
                        🚀 View Live Deployment
                    </a>
                </p>
                <p>
                    <a href="{args.run_url}" style="color: #007bff; text-decoration: none;">
                        📊 View Workflow Run
                    </a>
                </p>
            </div>
            
            <hr style="margin: 30px 0;">
            <p style="color: #6c757d; font-size: 12px;">
                This notification was sent automatically by GitHub Actions.
            </p>
        </body>
        </html>
        """
    else:
        subject = f"❌ Deployment Failed: {args.repository}"
        
        html_body = f"""
        <html>
        <body style="font-family: Arial, sans-serif;">
            <h2 style="color: #dc3545;">💥 Deployment Failed!</h2>
            
            <div style="background-color: #f8d7da; padding: 15px; border-radius: 5px; border-left: 4px solid #dc3545;">
                <h3>Failure Details</h3>
                <ul>
                    <li><strong>Repository:</strong> {args.repository}</li>
                    <li><strong>Branch:</strong> {args.branch}</li>
                    <li><strong>Commit:</strong> {args.commit[:7]}</li>
                    <li><strong>Triggered by:</strong> {args.actor}</li>
                    <li><strong>Workflow:</strong> {args.workflow}</li>
                    <li><strong>Timestamp:</strong> {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} UTC</li>
                </ul>
                
                <div style="margin-top: 15px;">
                    <strong>Error Message:</strong>
                    <p style="background-color: #fff; padding: 10px; border-radius: 3px; font-family: monospace;">
                        {getattr(args, 'error_message', 'Unknown error occurred')}
                    </p>
                </div>
            </div>
            
            <div style="margin-top: 20px;">
                <h3>Action Required</h3>
                <p>
                    Please check the workflow logs and fix the issues:
                    <a href="{args.run_url}" style="color: #007bff; text-decoration: none;">
                        📊 View Workflow Run
                    </a>
                </p>
            </div>
            
            <hr style="margin: 30px 0;">
            <p style="color: #6c757d; font-size: 12px;">
                This notification was sent automatically by GitHub Actions.
            </p>
        </body>
        </html>
        """
    
    return subject, html_body


def send_email(to_email, subject, html_body, provider='gmail'):
    """Send email using SMTP"""
    
    from_email = os.getenv('EMAIL_FROM')
    password = os.getenv('EMAIL_PASSWORD')
    
    if not from_email or not password:
        print("❌ Error: EMAIL_FROM or EMAIL_PASSWORD environment variables not set")
        return False
    
    if not to_email:
        print("❌ Error: Recipient email address not provided")
        return False
    
    # SMTP server configuration
    smtp_configs = {
        'gmail': {'server': 'smtp.gmail.com', 'port': 587},
        'outlook': {'server': 'smtp.office365.com', 'port': 587},
        'yahoo': {'server': 'smtp.mail.yahoo.com', 'port': 587},
    }
    
    config = smtp_configs.get(provider, smtp_configs['gmail'])
    
    try:
        # Create message
        msg = MIMEMultipart('alternative')
        msg['From'] = from_email
        msg['To'] = to_email
        msg['Subject'] = subject
        
        # Create plain text version (fallback)
        # Strip HTML tags for plain text version
        import re
        plain_text = re.sub('<[^<]+?>', '', html_body)
        plain_text = re.sub('\\s+', ' ', plain_text).strip()
        
        text_part = MIMEText(plain_text, 'plain')
        html_part = MIMEText(html_body, 'html')
        
        msg.attach(text_part)
        msg.attach(html_part)
        
        # Send email
        print(f"📧 Connecting to {config['server']}:{config['port']} as {from_email}")
        
        with smtplib.SMTP(config['server'], config['port']) as server:
            server.starttls()
            server.login(from_email, password)
            server.send_message(msg)
        
        print(f"✅ Email sent successfully to {to_email}")
        return True
        
    except Exception as e:
        print(f"❌ Failed to send email: {str(e)}")
        return False


def main():
    parser = argparse.ArgumentParser(description='Send GitHub Actions email notifications')
    
    # Required arguments
    parser.add_argument('--status', required=True, choices=['success', 'failure'])
    parser.add_argument('--to-email', required=True, help='Recipient email address')
    parser.add_argument('--repository', required=True, help='Repository name')
    parser.add_argument('--branch', required=True, help='Git branch')
    parser.add_argument('--commit', required=True, help='Commit SHA')
    parser.add_argument('--actor', required=True, help='GitHub actor (user who triggered)')
    parser.add_argument('--workflow', required=True, help='Workflow name')
    parser.add_argument('--run-url', required=True, help='GitHub Actions run URL')
    
    # Optional arguments
    parser.add_argument('--environment', default='unknown', help='Deployment environment')
    parser.add_argument('--deployment-url', default='', help='Live deployment URL')
    parser.add_argument('--error-message', default='', help='Error message for failed deployments')
    parser.add_argument('--provider', default='gmail', choices=['gmail', 'outlook', 'yahoo'])
    
    args = parser.parse_args()
    
    print(f"📨 Preparing to send {args.status} notification...")
    print(f"   Repository: {args.repository}")
    print(f"   Branch: {args.branch}")
    print(f"   Environment: {args.environment}")
    print(f"   Recipient: {args.to_email}")
    
    # Create email content
    subject, html_body = create_email_content(args)
    
    # Send email
    success = send_email(args.to_email, subject, html_body, args.provider)
    
    if not success:
        print("💥 Email notification failed!")
        sys.exit(1)
    
    print("🎉 Email notification sent successfully!")


if __name__ == "__main__":
    main()