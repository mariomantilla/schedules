import { Component } from "react"
import { supabase } from "../api";

function s(time) {
    return time.split(":").reduce((x, y) => parseInt(x)*60 + parseInt(y));
}

function duration(shift) {
    return s(shift.ends_at)-s(shift.starts_at)
}


function Day(props) {
    const rows = [];
    let lastEnds = 10*3600;
    for (let i = 0; i < props.shifts.length; i++) {
        let shift = props.shifts[i];
        let mT = s(shift.starts_at)-lastEnds;
        rows.push(<div key={i} className="border-2 rounded" style={{height: duration(shift)/60, marginTop: mT/60}}>{shift.client_id.name}</div>);
        lastEnds = s(shift.ends_at)
    }
    return (
    <div>
    <div className="p-2 border-b-2 mb-4">{props.name}</div>
    <div className="">{rows}</div>
    </div>
    )
}

class EmployeeSchedule extends Component {

    constructor(props) {
        super(props)
        this.state = {
            shifts: [],
            minHour: 0
        }
        this.fetchShifts = this.fetchShifts.bind(this);
        this.getShiftsFromDay = this.getShiftsFromDay.bind(this);
    }

    componentDidMount() {
        this.fetchShifts();
    }

    componentDidUpdate(prevProps) {
        if (this.props.employee.id !== prevProps.employee.id) {
          this.fetchShifts();
        }
    }

    async fetchShifts() {
        let { data: shifts, error } = await supabase
        .from("shifts")
        .select(`
            id,
            employee_id,
            client_id (
                name
            ),
            day,
            starts_at,
            ends_at
        `)
        .eq('employee_id', this.props.employee.id)
        .order("starts_at", { ascending: true });
        if (error) console.log(error.message);
        else {
            let minHour = shifts.reduce((prev, curr) => prev.Cost < curr.Cost ? prev : curr);
            this.setState({shifts: shifts, minHour: minHour});
        }
    }

    getShiftsFromDay(day) {
        return this.state.shifts.filter(shift => shift.day === day);
    };

    render() {
        return (
            <div>
                <h1 className={"border-b-4 border-black-500"}>{this.props.employee.name}</h1>
                <div className={"p-4 grid grid-cols-7 grid-flow-row gap-4 min-w-full"}>
                    <Day name={"Lunes"} shifts={this.getShiftsFromDay("monday")}></Day>
                    <Day name={"Martes"} shifts={this.getShiftsFromDay("tuesday")}></Day>
                    <Day name={"Miercoles"} shifts={this.getShiftsFromDay("wednesday")}></Day>
                    <Day name={"Jueves"} shifts={this.getShiftsFromDay("thursday")}></Day>
                    <Day name={"Viernes"} shifts={this.getShiftsFromDay("friday")}></Day>
                    <Day name={"Sábado"} shifts={this.getShiftsFromDay("saturday")}></Day>
                    <Day name={"Domingo"} shifts={this.getShiftsFromDay("sunday")}></Day>
                </div>
                
            </div>
        )
    }
}

export default EmployeeSchedule;