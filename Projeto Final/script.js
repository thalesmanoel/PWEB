let db;
const DB_NAME = 'MoviesDB';
const STORE_NAME = 'movies';

// Inicialização do banco de dados
function initDB() {
    const request = indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = function (event) {
        db = event.target.result;
        const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });

        objectStore.createIndex('titulo', 'titulo', { unique: false });
        objectStore.createIndex('ano', 'ano', { unique: false });
        objectStore.createIndex('genero', 'genero', { unique: false });
    };

    request.onsuccess = function (event) {
        db = event.target.result;

        // Se estiver na lista, carrega os filmes
        if (document.querySelector('tbody')) {
            loadMovies();
        }

        // Se estiver na tela de cadastro e houver filme a ser editado
        const editId = localStorage.getItem('editMovieId');
        if (editId) {
            const transaction = db.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.get(Number(editId));

            request.onsuccess = function () {
                const movie = request.result;
                if (movie) {
                    populateForm(movie);
                    localStorage.removeItem('editMovieId');
                }
            };
        }
    };

    request.onerror = function (event) {
        console.error('Erro ao abrir o banco de dados:', event.target.error);
    };
}

// Carregar filmes 
function loadMovies(searchText = '') {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = function () {
        let movies = request.result;
        if (searchText) {
            movies = movies.filter(movie =>
                movie.titulo.toLowerCase().includes(searchText.toLowerCase())
            );
        }
        displayMovies(movies);
    };
}

// Exibir filmes na tabela
function displayMovies(movies) {
    const tbody = document.querySelector('tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    movies.forEach(movie => {
        const tr = document.createElement('tr');

        tr.innerHTML = `
            <td>${movie.titulo}</td>
            <td>${movie.diretor}</td>
            <td>${movie.ano}</td>
            <td>${movie.genero}</td>
            <td>${movie.duracao} min</td>
            <td>${movie.classificacao}</td>
            <td>${movie.notaUsuario}</td>
            <td class="acoes">
                <button class="editar" title="Editar" onclick="editMovie(${movie.id})">&#9998;</button>
                <button class="deletar" title="Deletar" onclick="deleteMovie(${movie.id})">&#128465;</button>
            </td>
        `;

        tbody.appendChild(tr);
    });
}

// Editar filme
function editMovie(id) {
    localStorage.setItem('editMovieId', id);
    window.location.href = 'cadastro-filmes.html';
}

// Adicionar filme
function addMovie(movie) {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.add(movie);

    request.onsuccess = () => {
        clearForm();
        loadMovies();
    };
}

// Atualizar filme
function updateMovie(movie) {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(movie);

    request.onsuccess = () => {
        clearForm();
        loadMovies();
    };
}

// Deletar filme
function deleteMovie(id) {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    store.delete(id);
    loadMovies();
}

// Preencher formulário com dados do filme
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

// Limpar formulário
function clearForm() {
    const form = document.getElementById('movieForm');
    if (form) form.reset();
    const idField = document.getElementById('movieId');
    if (idField) idField.value = '';
}

// Inicialização
window.onload = function () {
    initDB();

    const form = document.getElementById('movieForm');
    if (form) {
        form.onsubmit = function (e) {
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
            if (id) {
                movie.id = parseInt(id);
                updateMovie(movie);
            } else {
                addMovie(movie);
            }
        };
    }

    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function (e) {
            loadMovies(e.target.value);
        });
    }
};

const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});
