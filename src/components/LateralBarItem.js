import { MdDelete } from "react-icons/md";
import React, { useState } from 'react';
import  ConfirmationModal from "./ConfirmationModal"


const LateralBarItem = ({ item, onDelete, onClick }) => {

    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    
    return (
        <div>
        <div
            className={"p-3 max-h-14 flex align-center justify-between border cursor-pointer"}
            onClick={onClick}
        >
            <span className={"truncate flex-grow"}>
                <span
                    className={`w-full flex-grow`}
                >
                    {item.name}
                </span>
            </span>
            <button
                className={"font-mono text-red-500 text-xl"}
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowDeleteConfirmation(true)
                }}
            >
                <MdDelete />
            </button>
        </div>
        <ConfirmationModal
                show={showDeleteConfirmation}
                handleClose={() => setShowDeleteConfirmation(false)}
                handleConfirm={(e) => {
                    onDelete();
                    setShowDeleteConfirmation(false)
                }}
                desc={"Vas a eliminar \""+item.name+"\" por completo (y toda la información asociada). Esta acción no puede deshacerse."}
        ></ConfirmationModal>
        </div>
    );
};

export default LateralBarItem;