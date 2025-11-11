#!/bin/bash

# Docker Compose helper script for local PostgreSQL development
echo "🐳 Dictation Drawing Game - Docker Compose Helper"
echo "================================================="
echo ""

case "$1" in
  start|up)
    echo "🚀 Starting PostgreSQL database..."
    docker-compose up -d postgres
    echo ""
    echo "✅ PostgreSQL is starting up!"
    echo "📊 Database URL: postgresql://postgres:password@localhost:5432/dictation_drawing_game"
    echo ""
    echo "⏳ Waiting for database to be ready..."
    
    # Wait for database to be healthy
    while ! docker-compose exec -T postgres pg_isready -U postgres -d dictation_drawing_game >/dev/null 2>&1; do
      printf "."
      sleep 1
    done
    echo ""
    echo "✅ Database is ready!"
    echo ""
    echo "🔧 Next steps:"
    echo "1. Update your .env.local with: POSTGRES_URL=postgresql://postgres:password@localhost:5432/dictation_drawing_game"
    echo "2. Run: npm run db:push"
    echo "3. Run: npm run dev"
    ;;
    
  stop|down)
    echo "🛑 Stopping PostgreSQL database..."
    docker-compose down
    echo "✅ Database stopped!"
    ;;
    
  restart)
    echo "🔄 Restarting PostgreSQL database..."
    docker-compose restart postgres
    echo "✅ Database restarted!"
    ;;
    
  logs)
    echo "📋 Showing PostgreSQL logs..."
    docker-compose logs -f postgres
    ;;
    
  status)
    echo "📊 Database status:"
    docker-compose ps postgres
    echo ""
    if docker-compose exec -T postgres pg_isready -U postgres -d dictation_drawing_game >/dev/null 2>&1; then
      echo "✅ Database is healthy and accepting connections"
    else
      echo "❌ Database is not ready"
    fi
    ;;
    
  clean)
    echo "🧹 Cleaning up database (this will DELETE all data)..."
    read -p "Are you sure? This will remove all data! (y/N): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      docker-compose down -v
      docker volume rm dictation-drawing-game_postgres_data 2>/dev/null || true
      echo "✅ Database data cleaned!"
    else
      echo "❌ Cancelled"
    fi
    ;;
    
  connect|psql)
    echo "🔗 Connecting to PostgreSQL..."
    docker-compose exec postgres psql -U postgres -d dictation_drawing_game
    ;;
    
  *)
    echo "Usage: $0 {start|stop|restart|logs|status|clean|connect}"
    echo ""
    echo "Commands:"
    echo "  start/up    - Start PostgreSQL database"
    echo "  stop/down   - Stop PostgreSQL database"
    echo "  restart     - Restart PostgreSQL database"
    echo "  logs        - Show database logs"
    echo "  status      - Show database status"
    echo "  clean       - Remove database and all data (destructive!)"
    echo "  connect     - Connect to database with psql"
    echo ""
    echo "Example:"
    echo "  $0 start     # Start the database"
    echo "  $0 logs      # View logs"
    echo "  $0 connect   # Connect with psql"
    ;;
esac