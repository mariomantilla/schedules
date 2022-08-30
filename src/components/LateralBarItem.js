import { MdDelete } from "react-icons/md";


const LateralBarItem = ({ item, onDelete, onClick }) => {
    
    return (
        <div
            className={"p-3 max-h-14 flex align-center justify-between border"}
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
                    onDelete();
                }}
            >
                <MdDelete />
            </button>
        </div>
    );
};

export default LateralBarItem;