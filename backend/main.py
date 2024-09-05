import google.generativeai as genai
import os
import requests
from flask import Flask, request, jsonify, make_response
from flask_cors import CORS

# Get the directory of the current script (main.py)
script_dir = os.path.dirname(os.path.abspath(__file__))

# Construct the full path to the apikey file
file_path = os.path.join(script_dir, 'apikey')



API_KEY = ""
with open(file_path, 'r') as file:
    API_KEY = file.read()


genai.configure(api_key=API_KEY)

app = Flask(__name__)
CORS(app)

@app.route("/summarise", methods=['POST'])
def summarise():
    data = request.get_json()
    text_to_summarize = " ".join(data['summaries'])
    model = genai.GenerativeModel("gemini-1.5-flash")
    response = model.generate_content("Write a summary in 250 words about the following titles of research papers in english : " + text_to_summarize)
    data = {
        'summary' : response.text
    }
    wbresponse = make_response(jsonify(data))
    return wbresponse
if __name__ == "__main__":
    app.run(debug=False)
