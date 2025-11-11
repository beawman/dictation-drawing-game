#!/bin/bash

# Word list generator script with common themes
echo "📝 Word List Generator"
echo "====================="
echo ""

if [ $# -eq 0 ]; then
    echo "Usage: $0 <theme> [output-file]"
    echo ""
    echo "Available themes:"
    echo "  animals      - Common animals"
    echo "  colors       - Basic colors"
    echo "  fruits       - Common fruits"
    echo "  vegetables   - Common vegetables"
    echo "  body         - Body parts"
    echo "  family       - Family members"
    echo "  weather      - Weather words"
    echo "  emotions     - Feeling words"
    echo "  shapes       - Basic shapes"
    echo "  numbers      - Number words"
    echo "  days         - Days of the week"
    echo "  months       - Months of the year"
    echo ""
    echo "Examples:"
    echo "  $0 animals my-animals.txt"
    echo "  $0 colors"
    exit 1
fi

THEME="$1"
OUTPUT="${2:-$THEME-wordlist.txt}"

echo "🎯 Theme: $THEME"
echo "📄 Output: $OUTPUT"
echo ""

case "$THEME" in
    animals)
        cat > "$OUTPUT" << 'EOF'
cat
dog
bird
fish
elephant
lion
tiger
mouse
rabbit
horse
cow
pig
sheep
chicken
duck
frog
bear
fox
wolf
deer
EOF
        ;;
    colors)
        cat > "$OUTPUT" << 'EOF'
red
blue
green
yellow
purple
orange
pink
brown
black
white
gray
gold
silver
violet
EOF
        ;;
    fruits)
        cat > "$OUTPUT" << 'EOF'
apple
banana
orange
grape
strawberry
watermelon
pineapple
cherry
lemon
peach
pear
plum
kiwi
mango
berry
EOF
        ;;
    vegetables)
        cat > "$OUTPUT" << 'EOF'
carrot
broccoli
potato
tomato
onion
pepper
corn
peas
beans
lettuce
spinach
celery
cucumber
radish
cabbage
EOF
        ;;
    body)
        cat > "$OUTPUT" << 'EOF'
head
eye
nose
mouth
ear
hand
arm
leg
foot
knee
elbow
finger
toe
hair
face
EOF
        ;;
    family)
        cat > "$OUTPUT" << 'EOF'
mom
dad
sister
brother
baby
grandma
grandpa
aunt
uncle
cousin
family
parent
child
son
daughter
EOF
        ;;
    weather)
        cat > "$OUTPUT" << 'EOF'
sun
rain
snow
wind
cloud
storm
rainbow
thunder
lightning
hot
cold
warm
cool
wet
dry
EOF
        ;;
    emotions)
        cat > "$OUTPUT" << 'EOF'
happy
sad
angry
excited
scared
surprised
tired
proud
silly
calm
worried
brave
shy
kind
loving
EOF
        ;;
    shapes)
        cat > "$OUTPUT" << 'EOF'
circle
square
triangle
rectangle
oval
star
heart
diamond
line
curve
round
straight
big
small
tiny
EOF
        ;;
    numbers)
        cat > "$OUTPUT" << 'EOF'
one
two
three
four
five
six
seven
eight
nine
ten
eleven
twelve
thirteen
fourteen
fifteen
EOF
        ;;
    days)
        cat > "$OUTPUT" << 'EOF'
monday
tuesday
wednesday
thursday
friday
saturday
sunday
today
tomorrow
yesterday
morning
afternoon
evening
night
weekend
EOF
        ;;
    months)
        cat > "$OUTPUT" << 'EOF'
january
february
march
april
may
june
july
august
september
october
november
december
spring
summer
autumn
winter
EOF
        ;;
    *)
        echo "❌ Unknown theme: $THEME"
        echo ""
        echo "Available themes: animals, colors, fruits, vegetables, body, family, weather, emotions, shapes, numbers, days, months"
        exit 1
        ;;
esac

# Count words
WORD_COUNT=$(wc -l < "$OUTPUT")

echo "✅ Generated $WORD_COUNT words for theme '$THEME'"
echo "📄 Saved to: $OUTPUT"
echo ""

# Validate the generated file
echo "🔍 Running validation..."
if [ -f "./scripts/validate-wordlist.sh" ]; then
    ./scripts/validate-wordlist.sh "$OUTPUT"
else
    echo "⚠️  Validation script not found. File created successfully."
fi

echo ""
echo "🚀 Next steps:"
echo "1. Review the word list: cat $OUTPUT"
echo "2. Edit if needed: nano $OUTPUT"
echo "3. Upload via teacher dashboard at /teacher"