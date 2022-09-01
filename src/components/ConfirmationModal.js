import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';


const ConfirmationModal = ({ show, handleConfirm, handleClose, desc }) => {
    
    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
            <Modal.Title>¿Estas seguro?</Modal.Title>
            </Modal.Header>
            <Modal.Body>{desc}</Modal.Body>
            <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
                Cancelar
            </Button>
            <Button variant="primary" onClick={handleConfirm}>
                Confirmar
            </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ConfirmationModal;