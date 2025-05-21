let db;
const DB_NAME = 'MoviesDB';
const STORE_NAME = 'movies';

// Inicialização do banco de dados
function initDB() {
    const request = indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = function(event) {
        db = event.target.result;
        const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        
        objectStore.createIndex('titulo', 'titulo', { unique: false });
        objectStore.createIndex('ano', 'ano', { unique: false });
        objectStore.createIndex('genero', 'genero', { unique: false });
    };

    request.onsuccess = function(event) {
        db = event.target.result;
        loadMovies();
    };

    request.onerror = function(event) {
        console.error('Erro ao abrir o banco de dados:', event.target.error);
    };
}

// Carregar filmes
function loadMovies(searchText = '') {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = function() {
        let movies = request.result;
        if(searchText) {
            movies = movies.filter(movie => 
                movie.titulo.toLowerCase().includes(searchText.toLowerCase())
            );
        }
        displayMovies(movies);
    };
}

// Exibir filmes
function displayMovies(movies) {
    const container = document.getElementById('moviesList');
    container.innerHTML = '';

    movies.forEach(movie => {
        const card = document.createElement('div');
        card.className = 'movie-card';
        card.innerHTML = `
            <h3>${movie.titulo} (${movie.ano})</h3>
            <p><strong>Diretor:</strong> ${movie.diretor}</p>
            <p><strong>Gênero:</strong> ${movie.genero}</p>
            <p><strong>Duração:</strong> ${movie.duracao} min</p>
            <p><strong>Nota:</strong> ${movie.notaUsuario}/5</p>
            <div class="movie-actions">
                <button onclick="editMovie(${movie.id})">Editar</button>
                <button onclick="deleteMovie(${movie.id})">Excluir</button>
            </div>
        `;
        container.appendChild(card);
    });
}

// Manipulação de formulário
document.getElementById('movieForm').onsubmit = function(e) {
    e.preventDefault();
    
    const movie = {
        titulo: document.getElementById('titulo').value,
        diretor: document.getElementById('diretor').value,
        ano: parseInt(document.getElementById('ano').value),
        genero: document.getElementById('genero').value,
        duracao: parseInt(document.getElementById('duracao').value),
        elenco: document.getElementById('elenco').value.split(',').map(s => s.trim()),
        classificacao: document.getElementById('classificacao').value,
        sinopse: document.getElementById('sinopse').value,
        notaUsuario: parseFloat(document.getElementById('notaUsuario').value),
        dataAdicao: new Date().toISOString().split('T')[0]
    };

    const id = document.getElementById('movieId').value;
    if(id) {
        movie.id = parseInt(id);
        updateMovie(movie);
    } else {
        addMovie(movie);
    }
};

// Operações CRUD
function addMovie(movie) {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.add(movie);

    request.onsuccess = () => {
        clearForm();
        loadMovies();
    };
}

function updateMovie(movie) {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(movie);

    request.onsuccess = () => {
        clearForm();
        loadMovies();
    };
}

function deleteMovie(id) {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    store.delete(id);
    loadMovies();
}

function editMovie(id) {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(id);

    request.onsuccess = function() {
        const movie = request.result;
        populateForm(movie);
    };
}

function populateForm(movie) {
    document.getElementById('movieId').value = movie.id;
    document.getElementById('titulo').value = movie.titulo;
    document.getElementById('diretor').value = movie.diretor;
    document.getElementById('ano').value = movie.ano;
    document.getElementById('genero').value = movie.genero;
    document.getElementById('duracao').value = movie.duracao;
    document.getElementById('elenco').value = movie.elenco.join(', ');
    document.getElementById('classificacao').value = movie.classificacao;
    document.getElementById('sinopse').value = movie.sinopse;
    document.getElementById('notaUsuario').value = movie.notaUsuario;
}

function clearForm() {
    document.getElementById('movieForm').reset();
    document.getElementById('movieId').value = '';
}

// Pesquisa
document.getElementById('searchInput').addEventListener('input', function(e) {
    loadMovies(e.target.value);
});

// Inicialização
window.onload = initDB;