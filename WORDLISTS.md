# Word List Management Guide

This guide explains how to create and upload word lists for the Dictation Drawing Game.

## 📝 Supported File Formats

The system supports two file formats for uploading word lists:

### 1. **Plain Text Files (.txt)**
- One word per line
- Simple and easy to create
- Perfect for basic word lists

### 2. **CSV Files (.csv)**
- Supports additional metadata (images, hints)
- Structured format with headers
- More advanced features

## 📋 File Format Examples

### Plain Text Format (`.txt`)

```
cat
dog
bird
fish
elephant
```

**Rules:**
- One word per line
- No special formatting needed
- Empty lines are ignored
- Case doesn't matter (will be normalized)

### CSV Format (`.csv`)

```csv
word,image
cat,/images/cat.png
dog,/images/dog.png
bird,/images/bird.png
fish,
elephant,/images/elephant.png
```

**Headers supported:**
- `word` or `Word` - The word to be dictated (required)
- `image` or `Image` - Optional hint image URL/path

**Rules:**
- First row must contain headers
- `word` column is required
- `image` column is optional
- Empty image values are allowed

## 🎯 Age-Appropriate Word Guidelines

### For Ages 4-5 (Preschool)
- **Length**: 3-5 letters
- **Complexity**: Simple, common objects
- **Examples**: cat, dog, sun, car, ball

### For Ages 5-6 (Kindergarten)
- **Length**: 3-6 letters
- **Complexity**: Familiar concepts, some two-syllable words
- **Examples**: house, tree, apple, happy, flower

### For Ages 6-7 (Grade 1)
- **Length**: 4-7 letters
- **Complexity**: More abstract concepts, compound words
- **Examples**: rainbow, butterfly, playground, friendship, monday, tuesday

## 📚 Pre-Made Word Lists

We've included several example word lists in the `examples/` folder:

### Basic Categories
- **`animals.txt`** - Common animals (cat, dog, bird, etc.)
- **`colors.txt`** - Basic colors (red, blue, green, etc.)
- **`fruits.txt`** - Common fruits (apple, banana, orange, etc.)
- **`transportation.txt`** - Vehicles and transport (car, bus, airplane, etc.)
- **`days-of-week.txt`** - Days of the week (monday, tuesday, etc.)
- **`months.txt`** - Months of the year (january, february, etc.)

### Advanced Examples
- **`animals-with-images.csv`** - Animals with hint images

## 🚀 How to Upload Word Lists

### Using the Teacher Dashboard

1. **Sign in as a teacher**
   - Go to `/teacher` page
   - Sign in with your Google account (must have teacher role)

2. **Navigate to Word Sets section**
   - Click on "Word Sets" tab
   - Click "Upload New Word Set" button

3. **Fill in the form**
   - **Title**: Give your word set a descriptive name (e.g., "Week 1 - Animals")
   - **File**: Choose your `.txt` or `.csv` file
   - Click "Upload"

4. **Activate the word set**
   - Once uploaded, click the "Activate" button to make it available to students
   - Only one word set can be active at a time

### API Upload (Advanced)

```bash
curl -X POST http://localhost:3000/api/wordsets \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "title=Week 1 - Animals" \
  -F "file=@animals.txt"
```

## 🎨 Adding Hint Images

### Image Requirements
- **Format**: PNG, JPG, or WEBP
- **Size**: Recommended 200x200 to 400x400 pixels
- **Style**: Simple, child-friendly illustrations
- **Background**: Preferably transparent or white

### Image Hosting Options

1. **Vercel Blob Storage** (Recommended)
   - Upload images through the dashboard
   - Automatic CDN delivery
   - Secure and fast

2. **Public URLs**
   - Use any public image URL
   - Ensure images are child-appropriate
   - Test image accessibility

3. **Local Images**
   - Place in `/public/images/` folder
   - Reference as `/images/filename.png`

### CSV with Images Example

```csv
word,image
cat,https://your-cdn.com/cat.png
dog,https://your-cdn.com/dog.png
bird,/images/bird.png
fish,
```

## ✅ Best Practices

### Word Selection
- Choose words children can visualize and draw
- Avoid abstract concepts for younger children
- Include a mix of nouns, simple verbs, and adjectives
- Test pronunciation with text-to-speech

### File Organization
- Use descriptive filenames (`week1-animals.txt`)
- Keep word lists to 5-15 words for younger children
- Group by theme or difficulty level
- Version your files (`animals-v2.txt`)

### Quality Control
- Spell-check all words
- Remove inappropriate content
- Test with actual children if possible
- Consider cultural appropriateness

## 🔧 Troubleshooting

### Common Upload Issues

**"Invalid file format"**
- Ensure file extension is `.txt` or `.csv`
- Check file encoding (use UTF-8)

**"No words found"**
- Check for empty lines in text files
- Verify CSV has proper headers
- Ensure words are not empty

**"Upload failed"**
- Check file size (under 1MB recommended)
- Verify you're signed in as a teacher
- Check network connection

### File Format Issues

**CSV not parsing correctly**
- Use proper comma separation
- Avoid commas within words
- Use quotes around fields with special characters
- Check for UTF-8 BOM issues

**Text file encoding problems**
- Save as UTF-8 encoding
- Avoid special characters that don't display properly
- Use standard line endings (LF or CRLF)

## 📱 Mobile Considerations

When creating word lists for touch devices:
- Choose words that are drawable with fingers
- Avoid overly complex shapes for younger children
- Consider screen size limitations
- Test on actual mobile devices

## 🔄 Updating Word Lists

### Versioning Strategy
1. Keep original files in version control
2. Use descriptive version numbers
3. Document changes in commit messages
4. Test thoroughly before deploying

### Gradual Rollout
1. Upload new word set as inactive
2. Test with small group of students
3. Gather feedback from teachers
4. Activate for all students
5. Monitor usage and performance

---

## 📞 Support

If you need help with word list creation or have questions:
1. Check this documentation first
2. Review example files in `/examples/` folder
3. Test with provided sample files
4. Contact system administrator if issues persist