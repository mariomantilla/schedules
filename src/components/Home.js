import { createRef, Component } from "react"
import RecoverPassword from "./RecoverPassword"
import LateralBarItem from "./LateralBarItem"
import Schedule from "./Schedule"
import { supabase } from "../api";


class Home extends Component {

    constructor(props) {
        super(props)
        this.state = {
            recoveryToken: props.recoveryToken,
            employees: [],
            clients: [],
            clientMode: false,
            errorText: "",
            selectedItem: null,
            selectedItemIsClient: null
        }
        this.newNameRef = createRef();

        this.addClientOrEmployee = this.addClientOrEmployee.bind(this);
        this.deleteItem = this.deleteItem.bind(this);

        this.fetchEmployees = this.fetchEmployees.bind(this);
        this.fetchClients = this.fetchClients.bind(this);

        this.selectItem = this.selectItem.bind(this);

        this.clearRecoveryToken = this.clearRecoveryToken.bind(this);
        this.showError = this.showError.bind(this);
    }

    componentDidMount() {
        this.fetchEmployees();
        this.fetchClients();
    }

    clearRecoveryToken() {
        this.setState({recoveryToken: null});
    }

    showError(msg) {
        this.setState({errorText: msg});
    }

    async selectItem(item) {
        this.setState({selectedItem: item, selectedItemIsClient: this.state.clientMode});
    }

    async fetchEmployees() {
        let { data: employees, error } = await supabase
            .from("employees")
            .select("id,name,shifts(id)")
            .order("name", { ascending: true });
        if (error) this.showError(error.message);
        else this.setState({employees: employees});
    }

    async fetchClients() {
        let { data: clients, error } = await supabase
            .from("clients")
            .select("id,name,shifts(id)")
            .order("name", { ascending: true });
        if (error) this.showError(error.message);
        else this.setState({clients: clients});
    }

    async deleteItem(item) {
        if (item.shifts.length) {
            let { data, error } = await supabase.from("shifts").delete().eq(this.state.clientMode ? "client_id" : "employee_id", item.id);
            if (error || data.length !== item.shifts.length) {
                this.showError(error ? error.message : "Error al eliminar");
                return
            }
        }
        let { data, error } = await supabase.from(this.state.clientMode ? "clients" : "employees").delete().eq("id", item.id);
        if (error) this.showError(error.message);
        else if (data.length === 0) this.showError("Error al eliminar");
        else if (this.state.clientMode) this.setState({clients: this.state.clients.filter((x) => x.id !== item.id)});
        else this.setState({employees: this.state.employees.filter((x) => x.id !== item.id)});
    }

    async addClientOrEmployee() {
        let rawName = this.newNameRef.current.value;
        let name = rawName.trim();
        if (name.length <= 3) this.showError("Introduce al menos 3 caracteres!");
        else {
            let { data: item, error } = await supabase
                .from(this.state.clientMode ? "clients" : "employees")
                .insert({ name: name })
                .single();
            if (error) this.showError(error.message);
            else {
                item.shifts = []
                if (this.state.clientMode) this.setState({clients: [item, ...this.state.clients].sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0)), errorText: ""});
                else this.setState({employees: [item, ...this.state.employees].sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0)), errorText: ""});
                this.newNameRef.current.value = "";
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

        let itemsToShow = this.state.clientMode ? this.state.clients : this.state.employees ;
        let noItemsMsg = this.state.clientMode ? "Aun no hay clientes!" : "Aun no hay empleados!" ;
        let addItemMsg = this.state.clientMode ? "Cliente" : "Empleado" ;

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
                className={"flex flex-col flex-grow p-4 w-1/4 min-w-max"}
                style={{ height: "calc(100vh - 4rem)" }}
            >
            <div className="p-2 flex">
            <span className="block w-full mx-1.5 rounded-md shadow-sm">
            
            <button
                        onClick={() => {this.setState({clientMode: false});this.newNameRef.current.value = "";}}
                        type="button"
                        disabled={!this.state.clientMode}
                        className="flex w-full justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:enabled:bg-blue-500 focus:outline-none focus:border-blue-700 focus:shadow-outline-blue active:enabled:bg-blue-700 transition duration-150 ease-in-out"
                    >
                        Empleados
                    </button></span>
                    <span className="block w-full mx-1.5 rounded-md shadow-sm">
                    <button
                        onClick={() => {this.setState({clientMode: true});this.newNameRef.current.value = "";}}
                        type="button"
                        disabled={this.state.clientMode}
                        className="flex w-full justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:enabled:bg-blue-500 focus:outline-none focus:border-blue-700 focus:shadow-outline-blue active:enabled:bg-blue-700 transition duration-150 ease-in-out"
                    >
                        Clientes
                    </button>
                    </span>

            </div>
            <div className="m-3 text-center text-lg font-bold">{addItemMsg}s</div>
                <div
                    className={`p-2 border flex-grow grid gap-2 ${
                        this.state.employees.length ? "auto-rows-min" : ""
                    } grid-cols-1 h-2/3 overflow-y-scroll`}
                >
                    {itemsToShow.length ? (
                        itemsToShow.map((item) => (
                            <LateralBarItem
                                key={item.id}
                                item={item}
                                onClick={() => this.selectItem(item)}
                                onDelete={() => this.deleteItem(item)}
                            />
                        ))
                    ) : (
                        <span
                            className={
                                "h-full flex justify-center items-center"
                            }
                        >
                            {noItemsMsg}
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
                <div className="text-xs m-4 mb-0">Nuevo {addItemMsg}</div>
                <div className={"flex m-4 mt-1 h-10"}>
                    <input
                        ref={this.newNameRef}
                        type="text"
                        placeholder={"Nombre del "+addItemMsg}
                        onKeyUp={(e) => e.key === "Enter" && this.addClientOrEmployee()}
                        className={
                            "bg-gray-200 border px-2 border-gray-300 w-full mr-4"
                        }
                    />
                    <button
                        onClick={this.addClientOrEmployee}
                        className={
                            "flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:border-blue-700 focus:shadow-outline-blue active:bg-blue-700 transition duration-150 ease-in-out"
                        }
                    >
                       Añadir
                    </button>
                </div>
            </div>
            <div
                className={"flex flex-col p-4 w-3/4 min-w-max"}
                style={{ height: "calc(100vh - 4rem)" }}
            >
            {this.state.selectedItem ? (
                <Schedule
                    item={this.state.selectedItem}
                    isClient={this.state.selectedItemIsClient}
                    clients={this.state.clients}
                    employees={this.state.employees}
                    showError={this.showError}
                    />
            ) : (
                <span className={"h-full flex justify-center items-center"}>
                    Selecciona un empleado o cliente para ver sus cuadrantes
                </span>
            )}
            </div>
                </div>
                
                </div>
        )
    }
}

export default Home;