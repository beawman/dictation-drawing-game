#!/bin/bash

# User role management script for Dictation Drawing Game
echo "👥 User Role Management"
echo "======================"
echo ""

if [ $# -eq 0 ]; then
    echo "Usage: $0 <command> [email] [role]"
    echo ""
    echo "Commands:"
    echo "  list                    - List all users and their roles"
    echo "  promote <email>         - Promote user to teacher"
    echo "  demote <email>          - Demote user to student"
    echo "  admin <email>           - Make user an admin"
    echo "  role <email> <role>     - Set specific role (student|teacher|admin)"
    echo "  find <email>            - Find specific user"
    echo ""
    echo "Examples:"
    echo "  $0 list"
    echo "  $0 promote teacher@school.edu"
    echo "  $0 find student@school.edu"
    echo "  $0 role user@example.com teacher"
    exit 1
fi

COMMAND="$1"
EMAIL="$2"
ROLE="$3"

# Check if database is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose not found. Please ensure database is running."
    exit 1
fi

# Check if database is running
if ! docker-compose ps postgres | grep -q "Up"; then
    echo "❌ Database is not running. Starting it now..."
    ./scripts/docker-db.sh start
    echo ""
fi

case "$COMMAND" in
    list)
        echo "📋 All users:"
        echo "============="
        docker-compose exec -T postgres psql -U postgres -d dictation_drawing_game -c "
        SELECT 
            email,
            name,
            role,
            created_at::date as joined,
            CASE 
                WHEN role = 'admin' THEN '👑'
                WHEN role = 'teacher' THEN '👩‍🏫'
                WHEN role = 'student' THEN '👨‍🎓'
                ELSE '❓'
            END as icon
        FROM users 
        ORDER BY role, email;
        " 2>/dev/null || echo "❌ Failed to connect to database"
        ;;
        
    find)
        if [ -z "$EMAIL" ]; then
            echo "❌ Email required for find command"
            exit 1
        fi
        
        echo "🔍 Looking for user: $EMAIL"
        echo "=========================="
        docker-compose exec -T postgres psql -U postgres -d dictation_drawing_game -c "
        SELECT 
            email,
            name,
            role,
            created_at,
            email_verified,
            image
        FROM users 
        WHERE email = '$EMAIL';
        " 2>/dev/null || echo "❌ Failed to connect to database"
        ;;
        
    promote)
        if [ -z "$EMAIL" ]; then
            echo "❌ Email required for promote command"
            exit 1
        fi
        
        echo "👩‍🏫 Promoting $EMAIL to teacher..."
        
        # Check if user exists
        USER_EXISTS=$(docker-compose exec -T postgres psql -U postgres -d dictation_drawing_game -t -c "SELECT COUNT(*) FROM users WHERE email = '$EMAIL';" 2>/dev/null | xargs)
        
        if [ "$USER_EXISTS" = "0" ]; then
            echo "❌ User $EMAIL not found. They need to sign in first."
            exit 1
        fi
        
        docker-compose exec -T postgres psql -U postgres -d dictation_drawing_game -c "
        UPDATE users SET role = 'teacher' WHERE email = '$EMAIL';
        " 2>/dev/null
        
        if [ $? -eq 0 ]; then
            echo "✅ Successfully promoted $EMAIL to teacher"
            echo "💡 User will need to sign out and back in to see changes"
        else
            echo "❌ Failed to promote user"
        fi
        ;;
        
    demote)
        if [ -z "$EMAIL" ]; then
            echo "❌ Email required for demote command"
            exit 1
        fi
        
        echo "👨‍🎓 Demoting $EMAIL to student..."
        
        docker-compose exec -T postgres psql -U postgres -d dictation_drawing_game -c "
        UPDATE users SET role = 'student' WHERE email = '$EMAIL';
        " 2>/dev/null
        
        if [ $? -eq 0 ]; then
            echo "✅ Successfully demoted $EMAIL to student"
            echo "💡 User will need to sign out and back in to see changes"
        else
            echo "❌ Failed to demote user"
        fi
        ;;
        
    admin)
        if [ -z "$EMAIL" ]; then
            echo "❌ Email required for admin command"
            exit 1
        fi
        
        echo "👑 Making $EMAIL an admin..."
        
        docker-compose exec -T postgres psql -U postgres -d dictation_drawing_game -c "
        UPDATE users SET role = 'admin' WHERE email = '$EMAIL';
        " 2>/dev/null
        
        if [ $? -eq 0 ]; then
            echo "✅ Successfully made $EMAIL an admin"
            echo "💡 User will need to sign out and back in to see changes"
        else
            echo "❌ Failed to make user admin"
        fi
        ;;
        
    role)
        if [ -z "$EMAIL" ] || [ -z "$ROLE" ]; then
            echo "❌ Both email and role required"
            echo "Valid roles: student, teacher, admin"
            exit 1
        fi
        
        if [[ ! "$ROLE" =~ ^(student|teacher|admin)$ ]]; then
            echo "❌ Invalid role: $ROLE"
            echo "Valid roles: student, teacher, admin"
            exit 1
        fi
        
        echo "🔄 Setting $EMAIL role to $ROLE..."
        
        docker-compose exec -T postgres psql -U postgres -d dictation_drawing_game -c "
        UPDATE users SET role = '$ROLE' WHERE email = '$EMAIL';
        " 2>/dev/null
        
        if [ $? -eq 0 ]; then
            echo "✅ Successfully set $EMAIL role to $ROLE"
            echo "💡 User will need to sign out and back in to see changes"
        else
            echo "❌ Failed to set user role"
        fi
        ;;
        
    *)
        echo "❌ Unknown command: $COMMAND"
        echo "Available commands: list, promote, demote, admin, role, find"
        exit 1
        ;;
esac

echo ""
echo "💡 Tips:"
echo "- Users must sign in at least once before role changes"
echo "- Changes take effect after user signs out and back in"
echo "- Use 'list' command to verify changes"