mkdir datacol-ai
set -l baseUrl 'localhost:5173';
for deck in 'a1' 'a2' 'b1' 'b2' 'c1' 'c2' 'c3';
  for ai in 'cohere' 'openai' 'claude';
    set -l outfile "datacol-ai/$deck-$ai.json"
    curl -X POST $baseUrl/api/solve -H "Content-Type: application/json" -d "{\"backend\":\"$ai\",\"deckCode\":\"$deck\"}" | jq .response > $outfile
  end
end