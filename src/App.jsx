import React, { useState, useEffect } from 'react';
import { set, ref, onValue, remove, update } from 'firebase/database';
import './App.css';
import { db } from './firebase';
import { uid } from 'uid';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Table, Form, Button, Modal } from 'react-bootstrap';
import { FaTrash, FaEdit } from 'react-icons/fa';

function App() {
  const [todo, setTodo] = useState('');
  const [description, setDescription] = useState('');
  const [genres, setGenres] = useState([
    'Romance',
    'Ficção Científica',
    'Fantasia',
    'Mistério',
    'Suspense',
    'Terror',
    'Aventura',
    'Biografia',
    'História',
  ]);
  const [genre, setGenre] = useState('');
  const [todos, setTodos] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [tempUuid, setTempUuid] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalTodo, setModalTodo] = useState('');
  const [modalDescription, setModalDescription] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [showDataModal, setShowDataModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [invalidFields, setInvalidFields] = useState([]);
  const [showSuccessAddModal, setShowSuccessAddModal] = useState(false);
  const [showSuccessUpdateModal, setShowSuccessUpdateModal] = useState(false);
  const [showSuccessDeleteModal, setShowSuccessDeleteModal] = useState(false);

  const handleTodoChange = (e) => {
    setTodo(e.target.value);
  };

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  const handleGenreChange = (e) => {
    setGenre(e.target.value);
  };

  // read
  useEffect(() => {
    onValue(ref(db), (snapshot) => {
      setTodos([]);
      const data = snapshot.val();
      if (data !== null) {
        Object.values(data).map((todo) => {
          setTodos((oldArray) => [...oldArray, todo]);
        });
      }
    });
  }, []);

  // write
  const writeToDatabase = () => {
    if (!modalTodo || !modalDescription || !genre) {
      setErrorMessage('Preencha todos os campos');
      setInvalidFields(
        ['formTodo', 'formDescription', 'formGenre']
          .filter((field) => !modalTodo && field === 'formTodo')
          .concat(
            ['formTodo', 'formDescription', 'formGenre']
              .filter((field) => !modalDescription && field === 'formDescription')
              .concat(
                ['formTodo', 'formDescription', 'formGenre'].filter((field) => !genre && field === 'formGenre')
              )
          )
      );
      return;
    }

    const titleExists = todos.some((todo) => todo.todo === modalTodo);

    if (titleExists) {
      setErrorMessage('O título já existe. Por favor, escolha um título diferente.');
      return;
    }

    const uuid = uid();
    set(ref(db, `/${uuid}`), {
      todo: modalTodo,
      description: modalDescription,
      genre: genre,
      uuid,
    });
    setModalTodo('');
    setModalDescription('');
    setGenre('');
    setShowModal(false);
    setShowSuccessAddModal(true);
    setErrorMessage('');
    setInvalidFields([]);
  };

  // update
  const handleUpdate = (todo) => {
    setIsEdit(true);
    setTempUuid(todo.uuid);
    setModalTodo(todo.todo);
    setModalDescription(todo.description);
    setGenre(todo.genre);
    setShowModal(true);
  };

  const handleSubmitChange = () => {
    if (!modalTodo || !modalDescription || !genre) {
      setErrorMessage('Preencha todos os campos');
      setInvalidFields(
        ['formTodo', 'formDescription', 'formGenre']
          .filter((field) => !modalTodo && field === 'formTodo')
          .concat(
            ['formTodo', 'formDescription', 'formGenre']
              .filter((field) => !modalDescription && field === 'formDescription')
              .concat(
                ['formTodo', 'formDescription', 'formGenre'].filter((field) => !genre && field === 'formGenre')
              )
          )
      );
      return;
    }

    const titleExists = todos.some((todo) => todo.todo === modalTodo && todo.uuid !== tempUuid);

    if (titleExists) {
      setErrorMessage('O título já existe. Por favor, escolha um título diferente.');
      return;
    }

    update(ref(db, `/${tempUuid}`), {
      todo: modalTodo,
      description: modalDescription,
      genre: genre,
      uuid: tempUuid,
    });

    setModalTodo('');
    setModalDescription('');
    setGenre('');
    setIsEdit(false);
    setShowModal(false);
    setShowSuccessUpdateModal(true);
    setErrorMessage('');
    setInvalidFields([]);
  };

  // delete
  const handleDelete = (todo) => {
    setTempUuid(todo.uuid);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirmation = () => {
    remove(ref(db, `/${tempUuid}`))
      .then(() => {
        setShowDeleteModal(false);
        setShowSuccessDeleteModal(true);
      })
      .catch((error) => {
        console.log('Erro ao excluir:', error);
      });
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
  };

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setModalTodo('');
    setModalDescription('');
    setGenre('');
    setIsEdit(false);
    setErrorMessage('');
    setInvalidFields([]);
  };

  const handleFieldClick = (data) => {
    setSelectedData(data);
    setShowDataModal(true);
  };

  const handleCloseDataModal = () => {
    setShowDataModal(false);
  };

  const handleInputChange = (field) => {
    if (invalidFields.includes(field)) {
      setInvalidFields(invalidFields.filter((f) => f !== field));
    }
  };

  const handleSuccessAddModalClose = () => {
    setShowSuccessAddModal(false);
  };

  const handleSuccessUpdateModalClose = () => {
    setShowSuccessUpdateModal(false);
  };

  const handleSuccessDeleteModalClose = () => {
    setShowSuccessDeleteModal(false);
  };

  return (
    <div className="App">
      <h1>CRUD Livro</h1>
      <div className="button-container d-flex justify-content-end">
        <Button variant="success" className="botao-sucesso" onClick={handleOpenModal}>
          Adicionar Livro
        </Button>
      </div>

      <div className="table-responsive">
        <Table className="App-table">
          <thead>
            <tr>
              <th>Título</th>
              <th>Autor</th>
              <th>Gênero</th>
              <th>Ver Dados</th>
              <th>Editar</th>
              <th>Apagar</th>
            </tr>
          </thead>
          <tbody>
            {todos.map((todo) => (
              <tr key={todo.uuid}>
                <td>{todo.todo}</td>
                <td>{todo.description}</td>
                <td>{todo.genre}</td>
                <td>
                  <Button variant="info" onClick={() => handleFieldClick(todo)} className="botao-info">
                    Ver
                  </Button>
                </td>
                <td>
                  <Button variant="primary" className="botao-primary" onClick={() => handleUpdate(todo)}>
                    <FaEdit />
                  </Button>
                </td>
                <td>
                  <Button variant="danger" className="botao-perigo" onClick={() => handleDelete(todo)}>
                    <FaTrash />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{isEdit ? 'Editar Livro' : 'Adicionar Livro'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formTodo">
              <Form.Label>Título</Form.Label>
              <Form.Control
                type="text"
                value={modalTodo}
                onChange={(e) => setModalTodo(e.target.value)}
                onInput={() => handleInputChange('formTodo')}
                className={invalidFields.includes('formTodo') ? 'invalid' : ''}
              />
            </Form.Group>

            <Form.Group controlId="formDescription">
              <Form.Label>Autor</Form.Label>
              <Form.Control
                type="text"
                rows={3}
                value={modalDescription}
                onChange={(e) => setModalDescription(e.target.value)}
                onInput={() => handleInputChange('formDescription')}
                className={invalidFields.includes('formDescription') ? 'invalid' : ''}
              />
            </Form.Group>

            <Form.Group controlId="formGenre">
              <Form.Label>Gênero do Livro</Form.Label>
              <Form.Select
                value={genre}
                onChange={handleGenreChange}
                onInput={() => handleInputChange('formGenre')}
                className={invalidFields.includes('formGenre') ? 'invalid' : ''}
              >
                <option value="">Selecione o gênero</option>
                {genres.map((genre) => (
                  <option value={genre} key={genre}>
                    {genre}
                  </option>
                ))}
              </Form.Select>
              {errorMessage && <p className="error-message">{errorMessage}</p>}
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          {isEdit ? (
            <>
              <Button variant="primary" onClick={handleSubmitChange} className="botao-sucesso">
                Salvar
              </Button>
              <Button variant="secondary" onClick={handleCloseModal} className="botao-primary">
                Fechar
              </Button>
            </>
          ) : (
            <>
              <Button variant="primary" className="botao-sucesso" onClick={writeToDatabase}>
                Adicionar Livro
              </Button>
              <Button variant="secondary" onClick={handleCloseModal} className="botao-primary">
                Fechar
              </Button>
            </>
          )}
        </Modal.Footer>
      </Modal>

      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Exclusão</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Deseja realmente excluir os dados?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={handleDeleteConfirmation}>
            Excluir
          </Button>
          <Button variant="secondary" onClick={handleCloseDeleteModal} className="botao-primary">
            Fechar
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showDataModal} onHide={handleCloseDataModal}>
        <Modal.Header closeButton>
          <Modal.Title>Dados do Livro</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedData && (
            <>
              <p>Título: {selectedData.todo}</p>
              <p>Autor: {selectedData.description}</p>
              <p>Gênero: {selectedData.genre}</p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDataModal} className="botao-primary">
            Fechar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de Sucesso ao Adicionar */}
      <Modal show={showSuccessAddModal} onHide={handleSuccessAddModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>Sucesso</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Livro adicionado com sucesso!</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleSuccessAddModalClose} className="botao-sucesso">
            Fechar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de Sucesso ao Editar */}
      <Modal show={showSuccessUpdateModal} onHide={handleSuccessUpdateModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>Sucesso</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Livro atualizado com sucesso!</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleSuccessUpdateModalClose} className="botao-sucesso">
            Fechar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de Sucesso ao Excluir */}
      <Modal show={showSuccessDeleteModal} onHide={handleSuccessDeleteModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>Sucesso</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Livro excluído com sucesso!</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleSuccessDeleteModalClose} className="botao-sucesso">
            Fechar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default App;
