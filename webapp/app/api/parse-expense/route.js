import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const body = await req.json();
    const { text, homeCurrency = 'USD', localCurrency = 'PHP', currentLocation = '', categories = [] } = body;

    if (!text || !text.trim()) {
      return NextResponse.json({ error: 'Text input is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        
        const prompt = `Parse the following travel expense description into a structured JSON object.
Input Text: "${text}"

Context:
- Active Home Currency (user's home base): ${homeCurrency}
- Active Local Currency (where the user is traveling): ${localCurrency}
- Active Location/City: ${currentLocation}

Available Categories (you MUST classify the expense into exactly one of these):
${JSON.stringify(categories.length > 0 ? categories : ['Accommodation', 'Transportation', 'Food & Drink', 'Everything Else'])}

Strict JSON Schema Output (Return ONLY a raw JSON block, do not include markdown \`\`\`json wraps, just plain text JSON):
{
  "amount": number (the expense amount in the logged currency, e.g. 300.00. Extract from text.),
  "currency": string (3-letter currency code, e.g. "PHP", "USD", "EUR", "THB", "VND", "IDR", "CAD", "MXN", "AUD". Default to local currency "${localCurrency}" unless another currency is explicitly mentioned, e.g., "dollars", "USD", "euros", "baht", etc.),
  "category": string (one of the available categories listed above. Be smart: "coffee"/"latte"/"lunch"/"dinner"/"food"/"restaurant"/"drink" is Food & Drink. "hotel"/"airbnb"/"stay" is Accommodation. "taxi"/"bus"/"grab"/"scooter"/"flight" is Transportation. Otherwise Everything Else.),
  "note": string (a short clean description of what it was, e.g. "Caramel macchiato at Siargao Coffee Company" or "Taxi ride", with the amount/currency clean-removed),
  "location": string (the city, town, or specific place/establishment where it occurred, e.g. "Siargao coffee company" or "Bangkok", extracted from the text if possible. Defaults to "${currentLocation}" if no specific location/establishment is mentioned),
  "tags": string[] (array of 1-3 lowercase keywords that represent details for down-the-road insights, e.g. ["coffee", "cafe", "sweets"] or ["grab", "ride", "commute"]),
  "worthIt": boolean (set to true if the text implies it was worth it, a highlight, highly recommended, or high quality, e.g. contains "worth it", "delicious", "amazing", "great", "love it", etc. Otherwise false)
}`;

        const response = await fetch(geminiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: prompt }]
            }]
          })
        });

        if (response.ok) {
          const data = await response.json();
          let geminiText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
          
          // Clean up markdown blocks if present
          let jsonStr = geminiText.trim();
          const markdownMatch = jsonStr.match(/```json\s*([\s\S]*?)\s*```/) || jsonStr.match(/```\s*([\s\S]*?)\s*```/);
          if (markdownMatch) {
            jsonStr = markdownMatch[1];
          }

          try {
            const parsedResult = JSON.parse(jsonStr.trim());
            return NextResponse.json({ ...parsedResult, parsedBy: 'gemini' });
          } catch (e) {
            console.error("Failed to parse JSON from Gemini response:", geminiText, e);
            // Fallthrough to local parser on parse error
          }
        } else {
          console.error("Gemini API call failed with status:", response.status, await response.text());
        }
      } catch (geminiError) {
        console.error("Error calling Gemini API:", geminiError);
        // Fallthrough to local parser
      }
    }

    // --- LOCAL REGEX FALLBACK PARSER ---
    const result = localParse(text, localCurrency, currentLocation);
    return NextResponse.json({ ...result, parsedBy: 'local' });

  } catch (error) {
    console.error("Error in parse-expense API route:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

function localParse(text, localCurrency, currentLocation) {
  let worthIt = false;
  let modifiedText = text.toLowerCase();

  // Detect worthIt
  const worthItKeywords = ['worth it', 'worthit', 'amazing', 'great', 'love', 'delicious', 'highly recommend', 'awesome', 'excellent', 'good'];
  for (const keyword of worthItKeywords) {
    if (modifiedText.includes(keyword)) {
      worthIt = true;
      break;
    }
  }

  // Extract amount (number)
  // Clean up typical voice dictation errors like "5:50" instead of "5.50"
  let cleanText = text.replace(/\b(\d+):(\d{2})\b/g, '$1.$2');
  const amountMatch = cleanText.match(/\d+(?:\.\d{1,2})?/);
  const amount = amountMatch ? parseFloat(amountMatch[0]) : 0;

  // Detect currency
  let currency = localCurrency;
  const currencyMap = {
    usd: ['usd', 'dollar', 'dollars'],
    eur: ['eur', 'euro', 'euros', '€'],
    thb: ['thb', 'baht', '฿'],
    php: ['php', 'peso', 'pesos', '₱'],
    vnd: ['vnd', 'dong', '₫'],
    idr: ['idr', 'rupiah', 'rp'],
    cad: ['cad', 'canadian'],
    mxn: ['mxn', 'pesos', 'mexican'],
    aud: ['aud', 'australian']
  };

  const textLower = cleanText.toLowerCase();
  for (const [code, keywords] of Object.entries(currencyMap)) {
    for (const keyword of keywords) {
      // Use regex word boundary or simple inclusion
      const regex = new RegExp(`\\b${keyword}\\b`, 'i');
      if (regex.test(textLower)) {
        currency = code.toUpperCase();
        break;
      }
    }
  }

  // Detect category
  let category = 'Everything Else';
  const categoryKeywords = {
    Accommodation: ['hostel', 'hotel', 'stay', 'airbnb', 'room', 'lodging', 'guesthouse', 'camp'],
    Transportation: ['ferry', 'bus', 'grab', 'taxi', 'flight', 'train', 'scooter', 'gas', 'fuel', 'ride', 'uber', 'bolt', 'tuktuk', 'moped', 'plane', 'transport', 'ticket'],
    'Food & Drink': ['breakfast', 'coffee', 'latte', 'cappuccino', 'macchiato', 'cafe', 'croissant', 'bakery', 'espresso', 'tea', 'machiato', 'lunch', 'sandwich', 'taco', 'tacos', 'burger', 'wrap', 'salad', 'noodle', 'noodles', 'dinner', 'restaurant', 'sushi', 'pasta', 'pizza', 'steak', 'curry', 'feast', 'beer', 'wine', 'cocktail', 'bar', 'food', 'drink', 'drinks', 'pub', 'bistro']
  };

  for (const [cat, keywords] of Object.entries(categoryKeywords)) {
    for (const keyword of keywords) {
      const regex = new RegExp(`\\b${keyword}\\b`, 'i');
      if (regex.test(textLower)) {
        category = cat;
        break;
      }
    }
  }

  // Extract location (after at, in, near)
  let extractedLocation = currentLocation;
  const locationMatch = cleanText.match(/\b(?:at|in|near)\s+([A-Z][a-zA-Z\s]{2,30})/);
  if (locationMatch && locationMatch[1]) {
    extractedLocation = locationMatch[1].trim();
  }

  // Extract tags (simple keyword match)
  const tagKeywords = ['coffee', 'beer', 'drinks', 'tuktuk', 'taxi', 'rent', 'massage', 'scooter', 'surf', 'tour', 'sim'];
  const tags = [];
  for (const tag of tagKeywords) {
    if (textLower.includes(tag)) {
      tags.push(tag);
    }
  }

  // Build note by removing amount and worth it keywords
  let note = cleanText;
  if (amountMatch) {
    note = note.replace(amountMatch[0], '');
  }
  // Clean up currency terms and "worth it"
  const cleanTerms = [
    'worth it', 'worthit', 'usd', 'dollars', 'dollar', 'euros', 'euro', 'eur', 'baht', 'thb', 
    'pesos', 'peso', 'php', 'dong', 'vnd', 'rupiah', 'idr', 'cad', 'mxn', 'aud'
  ];
  cleanTerms.forEach(term => {
    note = note.replace(new RegExp(`\\b${term}\\b`, 'gi'), '');
  });
  note = note.replace(/\s+/g, ' ').trim();
  // Capitalize first letter of note
  if (note.length > 0) {
    note = note.charAt(0).toUpperCase() + note.slice(1);
  }

  return {
    amount,
    currency,
    category,
    note: note || category,
    location: extractedLocation,
    tags,
    worthIt
  };
}
