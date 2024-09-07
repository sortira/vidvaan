import google.generativeai as genai
import os
from flask import Flask, request, jsonify, make_response
from flask_cors import CORS

# Get the directory of the current script (main.py)
script_dir = os.path.dirname(os.path.abspath(__file__))

# Construct the full path to the apikey file
file_path = os.path.join(script_dir, 'apikey')

# Load API Key
API_KEY = ""
try:
    with open(file_path, 'r') as file:
        API_KEY = file.read().strip()
except FileNotFoundError:
    raise Exception("API key file not found. Make sure 'apikey' file is present.")

# Configure Generative AI API
genai.configure(api_key=API_KEY)

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route("/summarise", methods=['POST'])
def summarise():
    try:
        # Retrieve JSON data from POST request
        data = request.get_json()
        if 'summaries' not in data:
            return jsonify({"error": "Missing 'summaries' in request body"}), 400

        # Join the summaries into a single text string
        text_to_summarize = " ".join(data['summaries'])

        # Initialize and use the model to generate a summary
        model = genai.GenerativeModel("gemini-1.5-flash")
        
        # Assuming the API provides a method called 'generate_text'
        response = model.generate_text(prompt="Write a summary in 250 words about the following titles of research papers in English: " + text_to_summarize)
        
        # Format response into a JSON-friendly structure
        result = {
            'summary': response['text']  # Ensure response contains 'text'
        }

        return make_response(jsonify(result), 200)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=False)
