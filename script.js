let data;
let currentIndex = 0;
let numWrong = 0;
let guessType;
const answers = new Map();

function startQuiz(type) {
    if (type !== 'pairs' && type !== 'names')
        return;

    document.getElementById('result-container').classList.add("hidden");
    document.getElementById('question-container').classList.remove("hidden");
    document.getElementById('quiz-menu').classList.add("hidden");
    document.getElementById('progress-bar').style.width = `0%`;

    guessType = type;
    document.getElementById('button-display').innerText = type === 'pairs' ? "Bonding, Lone Pairs" : "Submit"
    fetchData();
}

function fetchData() {
    fetch("input.txt")
        .then(response => response.text())
        .then(csvData => {
            data = csvData.trim().split('\n').map(line => {
                const split = line.split(',');
                return {
                    count: split[0],
                    names: split.slice(1),
                };
            });
            data = shuffleArray(data); // Shuffle the array
            showQuestion();
        });
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function showQuestion() {
    if (currentIndex < data.length) {
        const pair = data[currentIndex];
        question = (guessType === 'pairs') ? pair.names.join('/') : pair.count;
        document.getElementById('question').innerText = question;
        document.getElementById('user-input').value = ''; // Clear the user-input box
    } else {
        showResult();
    }
}

function checkAnswer() {
    const userAnswer = document.getElementById('user-input').value.trim();
    const pair = data[currentIndex];
    const question = (guessType === 'pairs') ? pair.names.join('/') : pair.count;
    const correctAnswer = (guessType === 'pairs') ? [pair.count.replace(/\D/g, '').slice(0, 1) + ", " + pair.count.replace(/\D/g, '').slice(1)] : pair.names;
    if (!answers.has(question)) {
        answers.set(question, {
            correctAnswer: '',
            incorrectAnswers: new Array(),
        });
    }

    if (correctAnswer.map(answer => answer.toUpperCase().replace(/\s/g, '').replace(/ *\([^)]*\) */g, "")).includes(userAnswer.toUpperCase().replace(/\s/g, ''))) {
        if (document.getElementById('result').innerText.includes('Incorrect')) {
            document.getElementById('result').innerText = '';
        }
        answers.get(question).incorrectAnswers.push('');
        answers.get(question).correctAnswer = userAnswer;
        currentIndex++;
        document.getElementById('progress-bar').style.width = `${(currentIndex / data.length) * 100}%`;

        showQuestion();
    } else {
        answers.get(question).incorrectAnswers.push(userAnswer);

        numWrong++;
        document.getElementById('result').innerText = `Incorrect (${correctAnswer.join('/')})`;
        showQuestion();
    }
}

function handleKeyPress(event) {
    if (event.key === 'Enter') {
        checkAnswer();
    }
}

function showResult() {
    const accuracy = ((currentIndex - numWrong) / currentIndex) * 100 || 0;
    document.getElementById('accuracy-display').innerText = `${accuracy.toFixed(2)}%`;

    const table = document.getElementById('answers-display');
    answers.forEach((answers, question) => {
        const templateClone = document.getElementById('answers-template').content.cloneNode(true);
        templateClone.querySelector('.question').innerText = question;
        templateClone.querySelector('.wrong-answers').innerText = answers.incorrectAnswers.join(', ');
        templateClone.querySelector('.correct-answer').innerText = answers.correctAnswer;

        table.appendChild(templateClone);
    })

    document.getElementById('result-container').classList.remove("hidden");
    document.getElementById('question-container').classList.add("hidden");
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById('user-input').addEventListener('keypress', handleKeyPress);

    document.getElementById("pair-count-button").addEventListener('click', () => {
        startQuiz("pairs")
    });
    document.getElementById("name-button").addEventListener('click', () => {
        startQuiz("names")
    });
});
