#!/bin/bash

# Student user generation script for testing and development
echo "👨‍🎓 Student User Generator"
echo "========================="
echo ""

if [ $# -eq 0 ]; then
    echo "Usage: $0 <command> [options]"
    echo ""
    echo "Commands:"
    echo "  generate <count>        - Generate random test students"
    echo "  create <name> <email>   - Create specific student"
    echo "  class <count> <grade>   - Generate students for a class"
    echo "  demo                    - Generate demo students"
    echo "  list                    - List all students"
    echo "  clean                   - Remove all test students"
    echo ""
    echo "Examples:"
    echo "  $0 generate 10          # Generate 10 random students"
    echo "  $0 create 'John Doe' john@school.edu"
    echo "  $0 class 25 'Grade 1'   # Generate 25 Grade 1 students"
    echo "  $0 demo                 # Generate sample students"
    exit 1
fi

COMMAND="$1"
PARAM1="$2"
PARAM2="$3"

# Check if database is running
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose not found. Please ensure database is running."
    exit 1
fi

if ! docker-compose ps postgres | grep -q "Up"; then
    echo "❌ Database is not running. Starting it now..."
    ./scripts/docker-db.sh start
    echo ""
fi

# Function to generate a random ID (UUID-like)
generate_id() {
    node -e "console.log(require('crypto').randomUUID())"
}

# Function to generate a random student name
generate_name() {
    local first_names=("Alex" "Emma" "Liam" "Olivia" "Noah" "Ava" "Ethan" "Sophia" "Mason" "Isabella" "William" "Mia" "James" "Charlotte" "Benjamin" "Amelia" "Lucas" "Harper" "Henry" "Evelyn")
    local last_names=("Smith" "Johnson" "Brown" "Davis" "Miller" "Wilson" "Moore" "Taylor" "Anderson" "Thomas" "Jackson" "White" "Harris" "Martin" "Thompson" "Garcia" "Martinez" "Robinson" "Clark" "Rodriguez")
    
    local first_idx=$((RANDOM % ${#first_names[@]}))
    local last_idx=$((RANDOM % ${#last_names[@]}))
    
    echo "${first_names[$first_idx]} ${last_names[$last_idx]}"
}

case "$COMMAND" in
    generate)
        if [ -z "$PARAM1" ]; then
            echo "❌ Please specify number of students to generate"
            exit 1
        fi
        
        COUNT="$PARAM1"
        echo "🏭 Generating $COUNT random test students..."
        echo ""
        
        for i in $(seq 1 $COUNT); do
            ID=$(generate_id)
            NAME=$(generate_name)
            EMAIL=$(echo "$NAME" | tr '[:upper:]' '[:lower:]' | sed 's/ /./g')@testschool.edu
            
            # Insert student into database
            docker-compose exec -T postgres psql -U postgres -d dictation_drawing_game -c "
            INSERT INTO users (id, name, email, role, \"emailVerified\", \"createdAt\") 
            VALUES (
                '$ID',
                '$NAME',
                '$EMAIL',
                'student',
                NOW(),
                NOW()
            );
            " 2>/dev/null
            
            if [ $? -eq 0 ]; then
                echo "✅ Created student: $NAME ($EMAIL)"
            else
                echo "❌ Failed to create: $NAME ($EMAIL)"
            fi
        done
        
        echo ""
        echo "🎉 Generated $COUNT test students!"
        ;;
        
    create)
        if [ -z "$PARAM1" ] || [ -z "$PARAM2" ]; then
            echo "❌ Please provide both name and email"
            echo "Usage: $0 create 'Student Name' student@example.com"
            exit 1
        fi
        
        NAME="$PARAM1"
        EMAIL="$PARAM2"
        ID=$(generate_id)
        
        echo "👤 Creating student: $NAME ($EMAIL)"
        
        docker-compose exec -T postgres psql -U postgres -d dictation_drawing_game -c "
        INSERT INTO users (id, name, email, role, \"emailVerified\", \"createdAt\") 
        VALUES (
            '$ID',
            '$NAME',
            '$EMAIL',
            'student',
            NOW(),
            NOW()
        );
        " 2>/dev/null
        
        if [ $? -eq 0 ]; then
            echo "✅ Successfully created student: $NAME"
        else
            echo "❌ Failed to create student (email might already exist)"
        fi
        ;;
        
    class)
        if [ -z "$PARAM1" ]; then
            echo "❌ Please specify number of students"
            exit 1
        fi
        
        COUNT="$PARAM1"
        GRADE="${PARAM2:-Class}"
        
        echo "🏫 Generating $COUNT students for $GRADE..."
        echo ""
        
        for i in $(seq 1 $COUNT); do
            ID=$(generate_id)
            NAME=$(generate_name)
            EMAIL=$(echo "$NAME" | tr '[:upper:]' '[:lower:]' | sed 's/ /./g').${grade}${i}@school.edu
            
            docker-compose exec -T postgres psql -U postgres -d dictation_drawing_game -c "
            INSERT INTO users (id, name, email, role, \"emailVerified\", \"createdAt\") 
            VALUES (
                '$ID',
                '$NAME',
                '$EMAIL',
                'student',
                NOW(),
                NOW()
            );
            " 2>/dev/null
            
            if [ $? -eq 0 ]; then
                echo "✅ Created: $NAME ($EMAIL)"
            else
                echo "❌ Failed: $NAME ($EMAIL)"
            fi
        done
        
        echo ""
        echo "🎉 Generated $COUNT students for $GRADE!"
        ;;
        
    demo)
        echo "🎭 Creating demo students..."
        echo ""
        
        # Pre-defined demo students
        declare -a demo_students=(
            "Alice Johnson,alice.johnson@demo.edu"
            "Bob Smith,bob.smith@demo.edu"
            "Carol Brown,carol.brown@demo.edu"
            "David Wilson,david.wilson@demo.edu"
            "Emma Davis,emma.davis@demo.edu"
            "Frank Miller,frank.miller@demo.edu"
            "Grace Taylor,grace.taylor@demo.edu"
            "Henry Moore,henry.moore@demo.edu"
        )
        
        for student in "${demo_students[@]}"; do
            IFS=',' read -r name email <<< "$student"
            ID=$(generate_id)
            
            docker-compose exec -T postgres psql -U postgres -d dictation_drawing_game -c "
            INSERT INTO users (id, name, email, role, \"emailVerified\", \"createdAt\") 
            VALUES (
                '$ID',
                '$name',
                '$email',
                'student',
                NOW(),
                NOW()
            );
            " 2>/dev/null
            
            if [ $? -eq 0 ]; then
                echo "✅ Created: $name ($email)"
            else
                echo "❌ Failed: $name (might already exist)"
            fi
        done
        
        echo ""
        echo "🎉 Demo students created!"
        ;;
        
    list)
        echo "📋 All students in database:"
        echo "==========================="
        docker-compose exec -T postgres psql -U postgres -d dictation_drawing_game -c "
        SELECT 
            name,
            email,
            \"createdAt\"::date as joined,
            CASE 
                WHEN email LIKE '%@demo.edu' THEN '🎭'
                WHEN email LIKE '%@testschool.edu' THEN '🧪'
                ELSE '👨‍🎓'
            END as type
        FROM users 
        WHERE role = 'student'
        ORDER BY \"createdAt\" DESC;
        " 2>/dev/null
        ;;
        
    clean)
        echo "🧹 Cleaning up test students..."
        read -p "Are you sure you want to remove ALL test students? (y/N): " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            docker-compose exec -T postgres psql -U postgres -d dictation_drawing_game -c "
            DELETE FROM users 
            WHERE role = 'student' 
            AND (
                email LIKE '%@testschool.edu' 
                OR email LIKE '%@demo.edu'
            );
            " 2>/dev/null
            
            if [ $? -eq 0 ]; then
                echo "✅ Test students removed!"
            else
                echo "❌ Failed to remove test students"
            fi
        else
            echo "❌ Cancelled"
        fi
        ;;
        
    *)
        echo "❌ Unknown command: $COMMAND"
        echo "Available commands: generate, create, class, demo, list, clean"
        exit 1
        ;;
esac

echo ""
echo "💡 Tips:"
echo "- Use 'list' to see all students"
echo "- Test students use @testschool.edu or @demo.edu emails"
echo "- Real students are created when they sign in with Google OAuth"
echo "- Use the teacher dashboard to manage real student data"