#!/bin/bash

# Word list validation script
echo "📝 Word List Validator"
echo "====================="
echo ""

if [ $# -eq 0 ]; then
    echo "Usage: $0 <word-list-file>"
    echo ""
    echo "Supported formats:"
    echo "  - .txt (plain text, one word per line)"
    echo "  - .csv (comma-separated with 'word' column)"
    echo ""
    echo "Examples:"
    echo "  $0 examples/animals.txt"
    echo "  $0 examples/animals-with-images.csv"
    exit 1
fi

FILE="$1"

# Check if file exists
if [ ! -f "$FILE" ]; then
    echo "❌ Error: File '$FILE' not found"
    exit 1
fi

# Get file extension
EXT="${FILE##*.}"
BASENAME=$(basename "$FILE")

echo "📄 Validating: $BASENAME"
echo "📝 Format: $EXT"
echo ""

# Initialize counters
WORD_COUNT=0
ERRORS=0
WARNINGS=0

if [ "$EXT" = "txt" ]; then
    echo "🔍 Checking plain text format..."
    echo ""
    
    # Check encoding
    if file "$FILE" | grep -q "UTF-8"; then
        echo "✅ Encoding: UTF-8"
    else
        echo "⚠️  Warning: File may not be UTF-8 encoded"
        ((WARNINGS++))
    fi
    
    # Process each line
    LINE_NUM=0
    while IFS= read -r line || [[ -n "$line" ]]; do
        ((LINE_NUM++))
        
        # Skip empty lines
        if [ -z "$(echo "$line" | xargs)" ]; then
            continue
        fi
        
        ((WORD_COUNT++))
        WORD=$(echo "$line" | xargs)  # Trim whitespace
        
        # Check word length
        WORD_LENGTH=${#WORD}
        if [ $WORD_LENGTH -lt 2 ]; then
            echo "⚠️  Line $LINE_NUM: Word '$WORD' is very short ($WORD_LENGTH chars)"
            ((WARNINGS++))
        elif [ $WORD_LENGTH -gt 15 ]; then
            echo "⚠️  Line $LINE_NUM: Word '$WORD' is very long ($WORD_LENGTH chars)"
            ((WARNINGS++))
        fi
        
        # Check for spaces (should be single words)
        if [[ "$WORD" =~ [[:space:]] ]]; then
            echo "❌ Line $LINE_NUM: Word contains spaces: '$WORD'"
            ((ERRORS++))
        fi
        
        # Check for special characters
        if [[ "$WORD" =~ [^a-zA-Z0-9\-] ]]; then
            echo "⚠️  Line $LINE_NUM: Word contains special characters: '$WORD'"
            ((WARNINGS++))
        fi
        
        # Check for numbers
        if [[ "$WORD" =~ [0-9] ]]; then
            echo "⚠️  Line $LINE_NUM: Word contains numbers: '$WORD'"
            ((WARNINGS++))
        fi
        
    done < "$FILE"
    
elif [ "$EXT" = "csv" ]; then
    echo "🔍 Checking CSV format..."
    echo ""
    
    # Check if file has header
    HEADER=$(head -n 1 "$FILE")
    if [[ "$HEADER" =~ word|Word ]]; then
        echo "✅ Header found: $HEADER"
    else
        echo "❌ Error: CSV must have 'word' or 'Word' column header"
        ((ERRORS++))
    fi
    
    # Count lines (excluding header)
    TOTAL_LINES=$(wc -l < "$FILE")
    WORD_COUNT=$((TOTAL_LINES - 1))
    
    # Basic CSV validation
    if [ $WORD_COUNT -lt 0 ]; then
        WORD_COUNT=0
    fi
    
    echo "📊 Found $WORD_COUNT data rows (plus header)"
    
else
    echo "❌ Error: Unsupported file format '$EXT'"
    echo "   Supported formats: .txt, .csv"
    ((ERRORS++))
fi

echo ""
echo "📊 Validation Results:"
echo "====================="
echo "📝 Words found: $WORD_COUNT"
echo "❌ Errors: $ERRORS"
echo "⚠️  Warnings: $WARNINGS"
echo ""

# Age-appropriate recommendations
if [ $WORD_COUNT -gt 0 ]; then
    echo "🎯 Age Recommendations:"
    if [ $WORD_COUNT -le 5 ]; then
        echo "   📚 Good for ages 4-5 (short attention span)"
    elif [ $WORD_COUNT -le 10 ]; then
        echo "   📚 Good for ages 5-6 (standard session)"
    elif [ $WORD_COUNT -le 15 ]; then
        echo "   📚 Good for ages 6-7 (longer session)"
    else
        echo "   📚 Consider splitting into multiple sessions"
        echo "      (current: $WORD_COUNT words, recommended: 5-15)"
    fi
fi

echo ""

# Final result
if [ $ERRORS -eq 0 ]; then
    if [ $WARNINGS -eq 0 ]; then
        echo "🎉 Perfect! File is ready to upload."
    else
        echo "✅ File is valid but has $WARNINGS warning(s)."
        echo "   Consider reviewing the warnings above."
    fi
    exit 0
else
    echo "❌ File has $ERRORS error(s) that must be fixed before uploading."
    exit 1
fi