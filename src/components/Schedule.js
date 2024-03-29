import { createRef, Component } from "react"
import { supabase } from "../api";
import Popover from 'react-bootstrap/Popover';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Button from 'react-bootstrap/Button';
import { MdDelete } from "react-icons/md";
import { BsClock } from "react-icons/bs";


function s(time) {
    return time.split(":").reduce((x, y) => parseInt(x)*60 + parseInt(y));
}

function displayTime(seconds) {
    return `${Math.round(seconds/3600)}h ${Math.round(seconds/60 % 60)}m`
}

function duration(shift) {
    return s(shift.ends_at)-s(shift.starts_at)
}

function rms(time) {
    return time.substr(0, time.lastIndexOf(":"));
}


function Day(props) {
    const rows = [];
    let lastEnds = props.minHour;
    for (let i = 0; i < props.shifts.length; i++) {
        let shift = props.shifts[i];
        let mT = s(shift.starts_at)-lastEnds;
        let name = props.isClient ? shift.employee_id.name : shift.client_id.name;
        rows.push(
        <div key={i} className="border-2 rounded-md relative hideParent bg-slate-900 text-white" style={{height: Math.max(duration(shift)/60, 50), marginTop: mT/60}}>
            <div className="absolute top-1 text-xl right-1 text-red-500 hideButton z-10"><button onClick={() => props.deleteShift(shift.id)}><MdDelete /></button></div>
            <div className="w-full text-center absolute top-0 text-xs">{rms(shift.starts_at)}</div>
            <div className="w-full text-center absolute top-1/2" style={{transform: "translateY(-50%)"}}>{name}</div>
            <div className="w-full text-center absolute bottom-0 text-xs">{rms(shift.ends_at)}</div>
        </div>
        );
        lastEnds = s(shift.ends_at)
    }
    return (
    <div>
    <div className="p-2 border-b-2 mb-4">{props.name}</div>
    <div className="">{rows}</div>
    </div>
    )
}

class Schedule extends Component {

    constructor(props) {
        super(props)
        this.state = {
            shifts: [],
            minHour: 0,
            timesCounts: {},
            totalTime: 0
        }

        this.newStartsRef = createRef();
        this.newEndsRef = createRef();
        this.newDayRef = createRef();
        this.newCrossItemRef = createRef();


        this.fetchShifts = this.fetchShifts.bind(this);
        this.addShift = this.addShift.bind(this);
        this.deleteShift = this.deleteShift.bind(this);
        this.getShiftsFromDay = this.getShiftsFromDay.bind(this);
    }

    componentDidMount() {
        this.fetchShifts();
    }

    componentDidUpdate(prevProps) {
        if (this.props.item.id !== prevProps.item.id || this.props.isClient !== prevProps.isClient) {
            this.fetchShifts();
        }
    }

    async fetchShifts() {
        let { data: shifts, error } = await supabase
        .from("shifts")
        .select(`
            id,
            employee_id (
                name
            ),
            client_id (
                name
            ),
            day,
            starts_at,
            ends_at
        `)
        .eq(this.props.isClient? "client_id" : "employee_id", this.props.item.id)
        .order("starts_at", { ascending: true });
        if (error) console.log(error.message);
        else {
            let minHour = shifts.map((shift) => s(shift.starts_at)).reduce((p, c) => p < c ? p : c, 10000000);
            let timesCounts = {};
            let totalTime = 0;
            shifts.forEach((shift) => {
                let name = shift[this.props.isClient? "employee_id" : "client_id" ].name
                if (!(name in timesCounts)) timesCounts[name] = 0;
                let time = duration(shift);
                timesCounts[name] += time;
                totalTime += time;
            });
            this.setState({
                shifts: shifts,
                minHour: minHour,
                timesCounts: timesCounts,
                totalTime: totalTime
            });
        }
    }

    async deleteShift(id) {
        let { data, error } = await supabase.from("shifts").delete().eq("id", id);
        if (error) console.log(error.message);
        else if (data.length === 0) console.log("Error al eliminar");
        else this.fetchShifts();
    }

    getShiftsFromDay(day) {
        return this.state.shifts.filter(shift => shift.day === day);
    };

    async addShift() {
        let startsAt = this.newStartsRef.current.value;
        let endsAt = this.newEndsRef.current.value;
        let day = this.newDayRef.current.value;
        let crossItem = this.newCrossItemRef.current.value;
        
        let employee_id = this.props.isClient ? crossItem : this.props.item.id;
        let client_id = this.props.isClient ? this.props.item.id: crossItem ;

        if (!(startsAt && endsAt && day && crossItem)) {
            this.props.showError("Datos no válidos!")
        }
        let { error } = await supabase
            .from("shifts")
            .insert({
                employee_id: employee_id,
                client_id: client_id,
                day: day,
                starts_at: startsAt,
                ends_at: endsAt,
            })
            .single();
        if (error) console.log(error.message);
        else {
            this.fetchShifts();
            this.newStartsRef.current.value = '';
            this.newEndsRef.current.value = '';
            this.newDayRef.current.value = '';
            this.newCrossItemRef.current.value = '';
        }
        
    }

    render() {
        let crossItemsList = this.props.isClient ? this.props.employees : this.props.clients ;
        let noItemsMsg = this.props.isClient ? "Sin empleados" : "Sin clientes";
        let counts = this.state.timesCounts;

        const popover = (
            <Popover id="hoursInfoPopover">
              <Popover.Header as="h3">Desglose de horas</Popover.Header>
              <Popover.Body>
                {   
                    Object.entries(counts).map(([name, value]) => (
                        <div key={name}><b>{name}</b>: {displayTime(value)}</div>
                    ))
                }
                <div className="divider" key="divider"></div>
                <div key="total">
                    <b>Total</b>: {displayTime(this.state.totalTime)}
                </div>
              </Popover.Body>
            </Popover>
        );

        return (
            <div>
                <div className="border-b-4 border-black-500">
                    <h1 className={"inline"}>
                        {this.props.item.name}
                    </h1>
                    <OverlayTrigger trigger="click" placement="bottom" overlay={popover}>
                        <Button variant="primary" onClick={() => null} className={"mt-2 ml-4 align-top"}>
                        <BsClock />
                        </Button>
                    </OverlayTrigger>
                    <div className="float-right">
                    <div className={"flex m-4 mt-1 h-10"}>
                    <span className="whitespace-nowrap mt-2">Añadir turno de</span>
                    <input
                        ref={this.newStartsRef}
                        type="time"
                        className={
                            "bg-gray-200 border px-2 border-gray-300 w-full mr-2 ml-2"
                        }
                    />
                    <span className=" mt-2">a</span>
                    <input
                        ref={this.newEndsRef}
                        type="time"
                        className={
                            "bg-gray-200 border px-2 border-gray-300 w-full mr-2 ml-2"
                        }
                    />
                    <span className=" mt-2">los</span>
                    <select className="mr-2 ml-2" ref={this.newDayRef}>
                        <option value="monday">Lunes</option>
                        <option value="tuesday">Martes</option>
                        <option value="wednesday">Miercoles</option>
                        <option value="thursday">Jueves</option>
                        <option value="friday">Viernes</option>
                        <option value="saturday">Sábado</option>
                        <option value="sunday">Domingo</option>
                    </select>
                    <select className="mr-2 ml-2" ref={this.newCrossItemRef}>
                        {crossItemsList.length ? (
                            crossItemsList.map((item) => (
                            <option key={item.id} value={item.id}>{item.name}</option>
                        ))
                    ) : (
                        <option disabled={true}>{noItemsMsg}</option>
                    )}
                    </select>
                    <button
                        onClick={this.addShift}
                        className={
                            "flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:border-blue-700 focus:shadow-outline-blue active:bg-blue-700 transition duration-150 ease-in-out"
                        }
                    >
                       +
                    </button>
                </div>
                    </div>
                </div>
                <div className={"p-4 grid grid-cols-7 grid-flow-row gap-4 min-w-full"}>
                    <Day name={"Lunes"} shifts={this.getShiftsFromDay("monday")} isClient={this.props.isClient} deleteShift={this.deleteShift} minHour={this.state.minHour}></Day>
                    <Day name={"Martes"} shifts={this.getShiftsFromDay("tuesday")} isClient={this.props.isClient} deleteShift={this.deleteShift} minHour={this.state.minHour}></Day>
                    <Day name={"Miercoles"} shifts={this.getShiftsFromDay("wednesday")} isClient={this.props.isClient} deleteShift={this.deleteShift} minHour={this.state.minHour}></Day>
                    <Day name={"Jueves"} shifts={this.getShiftsFromDay("thursday")} isClient={this.props.isClient} deleteShift={this.deleteShift} minHour={this.state.minHour}></Day>
                    <Day name={"Viernes"} shifts={this.getShiftsFromDay("friday")} isClient={this.props.isClient} deleteShift={this.deleteShift} minHour={this.state.minHour}></Day>
                    <Day name={"Sábado"} shifts={this.getShiftsFromDay("saturday")} isClient={this.props.isClient} deleteShift={this.deleteShift} minHour={this.state.minHour}></Day>
                    <Day name={"Domingo"} shifts={this.getShiftsFromDay("sunday")} isClient={this.props.isClient} deleteShift={this.deleteShift} minHour={this.state.minHour}></Day>
                </div>
                
            </div>
        )
    }
}

export default Schedule;