$file = "src/components/SessionReview.jsx"
$content = Get-Content $file -Raw

# Replace localStorage code with reviewStorage service
$content = $content -replace `
  "const reviews = JSON\.parse\(localStorage\.getItem\('flickerReviews'\) \|\| '\[\]'\);[\s\S]*?localStorage\.setItem\('flickerReviews', JSON\.stringify\(reviews\)\);[\s\S]*?setSaved\(true\);", `
  "const review = createReview({`n        packId: pack.id,`n        packName: pack.name,`n        rating,`n        intensity,`n        notes,`n        duration: sessionData?.duration || 0,`n        bookmarked: sessionData?.bookmarked || false,`n        bookmarkTime: sessionData?.bookmarkTime || null,`n      });`n      `n      saveReview(review);`n      setSaved(true);"

Set-Content $file -Value $content -NoNewline
Write-Host "Fixed SessionReview.jsx"
