import { createRef, Component } from "react"
import RecoverPassword from "./RecoverPassword"
import EmployeeItem from "./EmployeeItem"
import { supabase } from "../api";


class Home extends Component {

    constructor(props) {
        super(props)
        this.state = {
            recoveryToken: props.recoveryToken,
            employees: [],
            errorText: ""
        }
        this.newEmployeeNameRef = createRef();
        this.addEmployee = this.addEmployee.bind(this);
        this.deleteEmployee = this.deleteEmployee.bind(this);
        this.fetchEmployees = this.fetchEmployees.bind(this);
        this.clearRecoveryToken = this.clearRecoveryToken.bind(this);
        this.showError = this.showError.bind(this);
    }

    componentDidMount() {
        this.fetchEmployees();
    }

    clearRecoveryToken() {
        this.setState({recoveryToken: null});
    }

    showError(msg) {
        this.setState({errorText: msg});
    }

    async fetchEmployees() {
        let { data: employees, error } = await supabase
            .from("employees")
            .select("*")
            .order("id", { ascending: false });
        if (error) this.showError(error.message);
        else this.setState({employees: employees});
    }

    async deleteEmployee(id) {
        let { data, error } = await supabase.from("employees").delete().eq("id", id);
        if (error) this.showError(error.message);
        else if (data.length === 0) this.showError("Error al eliminar empleado!");
        else this.setState({employees: this.state.employees.filter((x) => x.id !== id)});
    }

    async addEmployee() {
        let rawName = this.newEmployeeNameRef.current.value;
        let name = rawName.trim();
        if (name.length <= 3) this.showError("Introduce al menos 3 caracteres!");
        else {
            let { data: employee, error } = await supabase
                .from("employees")
                .insert({ name: name })
                .single();
            if (error) this.showError(error.message);
            else {
                this.setState({employees: [employee, ...this.state.employees], errorText: ""});
                this.newEmployeeNameRef.current.value = "";
            }
        }
    }

    async handleLogout() {
        supabase.auth.signOut().catch(console.error);
    };

    render() {
        if (this.state.recoveryToken) {
            return (<RecoverPassword token={this.state.recoveryToken} setRecoveryToken={this.clearRecoveryToken} />); // 
        }
        return (
            <div className={"w-screen fixed flex flex-col min-h-screen bg-gray-50"}>
            <header
                className={
                    "flex justify-between items-center px-4 h-16 bg-gray-900"
                }
            >
                <span
                    className={
                        "text-2xl sm:text-4xl text-white font-sans"
                    }
                >
                    Cuadrantes
                </span>
                <button
                    onClick={this.handleLogout}
                    className={
                        "flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:border-blue-700 focus:shadow-outline-blue active:bg-blue-700 transition duration-150 ease-in-out"
                    }
                >
                    Cerrar sesión
                </button>
            </header>
            <div className="flex-1 flex flex-row">
                <div
                className={"flex flex-col flex-grow p-4 w-1/4"}
                style={{ height: "calc(100vh - 4rem)" }}
            >
                <div
                    className={`p-2 border flex-grow grid gap-2 ${
                        this.state.employees.length ? "auto-rows-min" : ""
                    } grid-cols-1 h-2/3 overflow-y-scroll first:mt-8`}
                >
                    {this.state.employees.length ? (
                        this.state.employees.map((employee) => (
                            <EmployeeItem
                                key={employee.id}
                                employee={employee}
                                onDelete={() => this.deleteEmployee(employee.id)}
                            />
                        ))
                    ) : (
                        <span
                            className={
                                "h-full flex justify-center items-center"
                            }
                        >
                            Aun no hay empleados!
                        </span>
                    )}
                </div>
                {!!this.state.errorText && (
                    <div
                        className={
                            "border max-w-sm self-center px-4 py-2 mt-4 text-center text-sm bg-red-100 border-red-300 text-red-400"
                        }
                    >
                        {this.state.errorText}
                    </div>
                )}
                <div className={"flex m-4 mt-5 h-10"}>
                    <input
                        ref={this.newEmployeeNameRef}
                        type="text"
                        placeholder="Nombre del empleado"
                        onKeyUp={(e) => e.key === "Enter" && this.addEmployee()}
                        className={
                            "bg-gray-200 border px-2 border-gray-300 w-full mr-4"
                        }
                    />
                    <button
                        onClick={this.addEmployee}
                        className={
                            "flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:border-blue-700 focus:shadow-outline-blue active:bg-blue-700 transition duration-150 ease-in-out"
                        }
                    >
                        Añadir
                    </button>
                </div>
            </div>
            <div
                className={"flex flex-col p-4 w-3/4"}
                style={{ height: "calc(100vh - 4rem)" }}
            >
            <span
                            className={
                                "h-full flex justify-center items-center"
                            }
                        >
                            Selecciona un empleado para ver sus cuadrantes
                        </span></div>
                </div>
                
                </div>
        )
    }
}

export default Home;