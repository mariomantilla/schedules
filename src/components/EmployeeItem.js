const EmployeeItem = ({ employee, onDelete, onClick }) => {
    
    return (
        <div
            className={"p-3 max-h-14 flex align-center justify-between border"}
            onClick={onClick}
        >
            <span className={"truncate flex-grow"}>
                <span
                    className={`w-full flex-grow`}
                >
                    {employee.name}
                </span>
            </span>
            <button
                className={"font-mono text-red-500 text-xl border px-2"}
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onDelete();
                }}
            >
                X
            </button>
        </div>
    );
};

export default EmployeeItem;