async function work() {
    const topic = document.getElementById("topic").value;
    const publications = [];

    // Fetch from all sources and consolidate the results
    await dblp(topic, publications);
    await arxiv(topic, publications);
    await openalex(topic, publications);

    displayPublications(publications);
}

async function openalex(topic, publications) {
    const encodedTopic = encodeURIComponent(topic);
    const url = `https://api.openalex.org/works?filter=title.search:${encodedTopic}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error fetching data: ${response.statusText}`);
        }

        const data = await response.json();
        data.results.forEach(work => {
            publications.push({
                title: work.title,
                year: work.publication_year,
                authors: work.authorships.map(authorship => authorship.author.display_name).join(', '),
                url: work.id,
                repo: 'OpenAlex'
            });
        });
    } catch (error) {
        console.error('Error fetching publications:', error);
    }
}

async function dblp(topic, publications) {
    let result = await fetch(encodeURI(`https://dblp.org/search/publ/api?q=${topic}&format=json`), {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
        },
    })
    .then(response => response.json());

    const papers = result["result"]["hits"]["hit"]; // an array of papers

    papers.forEach(paper => {
        let authors = 'Unknown';

        // Check if the authors field exists
        if (paper.info.authors && paper.info.authors.author) {
            if (Array.isArray(paper.info.authors.author)) {
                // If it's an array, map over the array
                authors = paper.info.authors.author.map(a => a.text).join(', ');
            } else {
                // If it's an object, handle it as a single author
                authors = paper.info.authors.author.text;
            }
        }

        publications.push({
            title: paper.info.title,
            year: paper.info.year,
            authors: authors,
            url: paper.info.url,
            repo: 'DBLP'
        });
    });
}

async function arxiv(topic, publications) {
    const encodedTopic = encodeURIComponent(topic);
    const url = `http://export.arxiv.org/api/query?search_query=all:${encodedTopic}&start=0&max_results=100`;

    try {
        const response = await fetch(url);
        const data = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(data, "text/xml");

        const entries = xmlDoc.getElementsByTagName("entry");

        for (let i = 0; i < entries.length; i++) {
            const entry = entries[i];
            const title = entry.getElementsByTagName("title")[0].textContent.trim();
            const publishedDate = entry.getElementsByTagName("published")[0].textContent;
            const year = new Date(publishedDate).getFullYear();
            const url = entry.getElementsByTagName("id")[0].textContent.trim();
            const authors = Array.from(entry.getElementsByTagName("author")).map(author => author.getElementsByTagName("name")[0].textContent).join(', ');

            publications.push({
                title,
                year,
                authors,
                url,
                repo: 'ArXiv'
            });
        }
    } catch (error) {
        console.error('Error fetching publications:', error);
    }
}

function displayPublications(publications) {
    const publicationContainer = document.getElementById('publications');
    publicationContainer.innerHTML = "<h2>Search Results</h2>";

    if (publications.length === 0) {
        publicationContainer.innerHTML += "<p>No publications found for this topic.</p>";
    } else {
        // Create the table and header row
        const table = document.createElement('table');
        table.className = 'sortable';
        table.style.borderCollapse = 'collapse';

        const headerRow = document.createElement('tr');

        const titleHeader = document.createElement('th');
        titleHeader.textContent = 'Title';
        titleHeader.style.border = '1px solid black';
        titleHeader.style.padding = '8px';
        titleHeader.style.textAlign = 'left';

        const yearHeader = document.createElement('th');
        yearHeader.textContent = 'Year';
        yearHeader.style.border = '1px solid black';
        yearHeader.style.padding = '8px';
        yearHeader.style.textAlign = 'left';

        const authorsHeader = document.createElement('th');
        authorsHeader.textContent = 'Authors';
        authorsHeader.style.border = '1px solid black';
        authorsHeader.style.padding = '8px';
        authorsHeader.style.textAlign = 'left';

        const repoHeader = document.createElement('th');
        repoHeader.textContent = 'Academic Database';
        repoHeader.style.border = '1px solid black';
        repoHeader.style.padding = '8px';
        repoHeader.style.textAlign = 'left';

        headerRow.appendChild(titleHeader);
        headerRow.appendChild(yearHeader);
        headerRow.appendChild(authorsHeader);
        headerRow.appendChild(repoHeader);
        table.appendChild(headerRow);

        // Append rows for each publication
        publications.forEach(pub => {
            const row = document.createElement('tr');

            const titleCell = document.createElement('td');
            const link = document.createElement('a');
            link.href = pub.url;
            link.textContent = pub.title;
            link.target = '_blank'; // Opens the link in a new tab
            titleCell.appendChild(link);
            titleCell.style.border = '1px solid black';
            titleCell.style.padding = '8px';

            const yearCell = document.createElement('td');
            yearCell.textContent = pub.year;
            yearCell.style.border = '1px solid black';
            yearCell.style.padding = '8px';

            const authorsCell = document.createElement('td');
            authorsCell.textContent = pub.authors;
            authorsCell.style.border = '1px solid black';
            authorsCell.style.padding = '8px';

            const repoCell = document.createElement('td');
            repoCell.textContent = pub.repo;
            repoCell.style.border = '1px solid black';
            repoCell.style.padding = '8px';

            row.appendChild(titleCell);
            row.appendChild(yearCell);
            row.appendChild(authorsCell);
            row.appendChild(repoCell);
            table.appendChild(row);
        });

        // Append the table to the container
        publicationContainer.appendChild(table);
    }
}
