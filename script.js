function analyzeResume() {
    const input = document.getElementById('resumeInput');
    const file = input.files[0];

    if (!file || !file.name.endsWith('.pdf')) {
        alert('Please upload a valid PDF file (.pdf)');
        return;
    }

    document.getElementById('loading').style.display = 'block';
    document.getElementById('result').innerHTML = '';

    const reader = new FileReader();
    reader.onload = function () {
        const typedArray = new Uint8Array(this.result);

        pdfjsLib.getDocument(typedArray).promise.then(pdf => {
            let pagePromises = [];

            for (let i = 1; i <= pdf.numPages; i++) {
                pagePromises.push(
                    pdf.getPage(i).then(page => {
                        return page.getTextContent().then(content => {
                            return content.items.map(item => item.str).join(' ');
                        });
                    })
                );
            }

            Promise.all(pagePromises).then(pagesText => {
                const fullText = pagesText.join(' ').toLowerCase();
                processResumeText(fullText);
            });
        }).catch(err => {
            document.getElementById('loading').style.display = 'none';
            alert('Error reading PDF: ' + err.message);
        });
    };

    reader.readAsArrayBuffer(file);
}

function processResumeText(text) {
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    const emailMatches = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[a-z]{2,}\b/g);
    const email = emailMatches ? emailMatches.join(', ') : 'Not found';

    const skills = [
        'html', 'css', 'javascript', 'react', 'node', 'python', 'java',
        'sql', 'bootstrap', 'mongodb', 'typescript', 'express', 'django'
    ];
    const foundSkills = skills.filter(skill => text.includes(skill));

    const resultHTML = `
        <h4 class="text-success">Analysis Result:</h4>
        <p><strong style="color: #3f51b5;">📝 Total Words:</strong> 
            <span style="color: #ff5722;">${wordCount}</span></p>
        <p><strong style="color: #3f51b5;">✉ Email Found:</strong> 
            <span style="color: #009688;">${email}</span></p>
        <p><strong style="color: #3f51b5;">💻 Skills Detected:</strong> 
            <span style="color: #4caf50;">${foundSkills.length ? foundSkills.join(', ') : 'None'}</span></p>
    `;

    document.getElementById('loading').style.display = 'none';
    document.getElementById('result').innerHTML = resultHTML;
}