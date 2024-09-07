![logo](https://github.com/user-attachments/assets/3c35d6cb-d5e2-4eb9-ad39-1621a47631a4)

## 📚 Vidvaan


Welcome to **Vidvaan**! A comprehensive web application that consolidates academic publications from multiple sources like DBLP, ArXiv, and OpenAlex, all in one place. Easily search, view, and download results as an Excel file, with AI powered features.🚀

## 🌟 Features
- **AI Summarisation:** Time is money, hence press a single button to get the _TLDR_ and get things going!
- **AI Chatbot:** Need an intellectual discussion about a topic? Chat away with Google's latest LLM Gemini which makes things clear even to a toddler. 
- **Multi-source Search:** Query multiple academic databases simultaneously.
- **Real-time Results:** Instant search with debouncing to limit frequency.
- **Pagination Controls:** Navigate large result sets with ease.
- **Export to Excel:** Download your search results in `.xls` format.
- **Dynamic Updates:** View partial results while the full search is still running.

## 🛠️ Tech Stack

- **HTML5 & CSS3**: For structuring and styling the application.
- **JavaScript**: The core logic of the application.
- **jQuery**: Simplifying DOM manipulation and AJAX calls.
- **Python**: For the backend using Flask
- **APIs Used**:
  - DBLP
  - ArXiv
  - OpenAlex
  - Google Gemini for the LLM 
- **External Libraries**:
  - `SheetJS`: For exporting HTML tables to Excel files.

## 🚀 Getting Started

1. **Clone the repository**:
    ```bash
    git clone https://github.com/your-username/vidvaan.git
    ```
2. **Open the project folder**:
    ```bash
    cd vidvaan
    ```
3. **Execute the command**
   
   Make sure bs4, pandas, tqdm, flask and jsonify are installed
   
   ```bash
     python.exe backend/main.py
   ``` 
5. **Open `index.html`** in your favorite web browser and change `window.serverlink` to localhost address in `script.js`

## 📄 How to Use

1. **Search for a Topic**: Enter your search topic in the input field and click the **Search** button.
2. **View Results**: Results from DBLP, ArXiv, OpenLibrary, and OpenAlex will be displayed in a sortable table.
3. **Pagination**: Use the vertical pagination buttons to navigate through pages of results.
4. **Export to Excel**: Click on the **Download Excel** button to export the current search results.
5. **AI Summarisation**: Click the **AI Summarise** button to get AI Summary which saves time.
6. **AI Chatbot** : Click the chatbot icon in the bottom right to start an intellectual convo in seconds!

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/sortira/vidvaan/issues) or submit a pull request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 💻 Authors from Team D3G3N at IIEST Shibpur

- **Aritro Shome** - [GitHub](https://github.com/sortira)
- **SK Asif Tanvir**
- **Sagnik**
- **Prayas Sinha**
- **Ahana Pal**
- **Debjani Mondal**

## ⭐ Acknowledgments

- Thanks to the developers of the APIs, academic databases and libraries used in this project.

  - DBLP
  - ArXiv
  - OpenAlex
  - Gemini
  - SheetJS

# Nerd Fonts

This is an archived font from the Nerd Fonts release v3.2.1.

For more information see:
* https://github.com/ryanoasis/nerd-fonts/
* https://github.com/ryanoasis/nerd-fonts/releases/latest/

# Fira Code

**Fira Code** is a free monospaced font with programming ligatures.

For more information have a look at the upstream website: https://github.com/tonsky/FiraCode


