<template>
  <div>
    <table class="center">
      <tr v-for="(floor, i_row) in floors" :key="i_row">
        <td v-for="i_col in columns" :key="i_col" :style="tdStyle(i_col)">
          <strong class="p-abs"> {{ print(i_col, i_row) }} </strong>
          <span v-html="floorText(i_row, i_col)" />
          <el-button
            @click="onClickCall(i_row)"
            :disabled="floor.btnText != 'Call'"
            :type="floor.btnText == 'waiting' ? 'danger' : 'success'"
            size="mini"
            :plain="floor.btnText == 'Arrived'"
            v-if="i_col == columns"
            >{{ floor.btnText }}</el-button
          >
          <SomeIcon
            v-else-if="i_row == floors.length - 1 && i_col != 1"
            class="my-icon"
            :color="elevators[i_col].color"
            :style="`margin-top:${elevators[i_col].marginTop}px`"
          />
        </td>
      </tr>
    </table>
  </div>
</template>

<script>
import SomeIcon from "../assets/SomeIcon";
const startMargin = -31;
export default {
  components: { SomeIcon },
  data() {
    return {
      floors: [],
      elevators: {},
      schedule: {},
      queue: [],
    };
  },
  name: "Layout",
  created() {
    for (let i = 2; i <= 6; i++) {
      this.elevators[i] = {
        marginTop: startMargin,
        availible: true,
        floor: 0,
        // orders: [],
        // timeCount: null,
        // interval: null,
      };
    }

    this.floors = new Array(25).fill(1).map(() => {
      return { btnText: "Call" };
    });
  },
  computed: {
    columns() {
      return Object.keys(this.elevators).length + 2;
    },
    nextElevatorSchedule() {
      if (!Object.values(this.schedule).length) return "";
      return Object.values(this.schedule).find((s) => {
        if (!s.elevator) return false;
        if (s.assigned) return false;
        return true;
      });
    },
    scheduledQueue() {
      try {
        return Object.values(this.schedule).filter((s) => s.status == "queue");
      } catch (error) {
        return false;
      }
    },
    minOrderTime() {
      let ov = Object.values(this.schedule)
        .filter((o) => !o.assigned)
        .map((o) => o.orderTime);
      ov = Math.min(...ov);
      return ov;
    },
    floorsLength() {
      return this.floors.length - 1;
    },
  },
  methods: {
    assignElevator() {
      let entries = Object.entries(this.elevators);

      console.log({ entries });
    },
    print(i_col, i_row) {
      if ([1, this.columns].includes(i_col)) return "";
      let scheduleOrder = Object.values(this.schedule).find(
        (s) =>
          s.time && s.floor == i_row && s.elevator == i_col && s.status != "end"
      );
      if (scheduleOrder) return (scheduleOrder.time / 10).toFixed(1) + "Sec";

      // else return this.nextElevator;
      // if (scheduleOrder) return scheduleOrder.orderTime;
    },
    isElevatorOnTheFloor(i_row) {
      for (let key in this.elevators) {
        let values = this.elevators[key];

        if (values.floor == this.floorsLength - i_row && values.availible)
          throw key;
      }
    },
    // pushToQueue(i_row, orderTime) {
    //   // const { schedule, minOrderTime, elevators } = this;
    //   // if (!minOrderTime) alert("sdfsfsfdeeee");
    //   // // if (!this.queue.includes(i_row)) {
    //   // // queue.push(i_row);
    //   // if (elevators[aei].orders.includes(orderTime)) return;
    //   // elevators[aei].orders.push(orderTime);
    //   // schedule[minOrderTime].assigned = true;
    //   // console.log({ schedule_minOrderTime: schedule[minOrderTime] });
    // },
    findAvailableElev(i_row) {
      //initial distance check

      let availableElevators = Object.entries(this.elevators).filter(
        (elev) => elev[1].availible
      );
      if (!availableElevators.length) throw "all Occupied";
      let closestKey = availableElevators[0][0];
      let distance = Math.abs(
        this.floorsLength - i_row - availableElevators[0][1].floor
      );

      availableElevators.forEach((ae) => {
        let nextDistanceCheck = Math.abs(
          this.floorsLength - i_row - ae[1].floor
        );

        if (distance > nextDistanceCheck) {
          distance = nextDistanceCheck;
          closestKey = ae[0];
        }
      });

      return closestKey;
    },

    onClickCall(i_row) {
      let orderTime = new Date().getTime();

      let _this = this;
      _this.schedule[orderTime] = {
        floor: i_row,
        orderTime,
        time: 0,
        status: "queue",
        interval: "",
      };

      _this.schedule[orderTime].interval = setInterval(function () {
        if (_this.schedule[orderTime].time > 500)
          clearInterval(_this.schedule[orderTime].interval);
        _this.schedule[orderTime].time++;
      }, 100);

      this.callElevator(i_row, orderTime);
    },
    async callElevator(i_row, orderTime = "") {
      this.floors[i_row].btnText = "waiting";

      let aei; //availableElevatorIndex
      try {
        aei = this.findAvailableElev(i_row);
      } catch (error) {
        // this.assignElevator(i_row, orderTime);
        this.schedule[orderTime].elevator = this.nextElevatorSchedule.elevator;
        setTimeout(() => {
          this.schedule[this.nextElevatorSchedule.orderTime].assigned = true;
        }, 50);
        // console.log(error);
        return;
        // return this.pushToQueue(i_row, orderTime);
      }
      // console.log({ aei });

      try {
        this.isElevatorOnTheFloor(i_row);
      } catch (key) {
        clearInterval(this.schedule[orderTime].interval);

        aei = key;
        this.elevators[aei].color = "green";
        setTimeout(() => {
          this.elevators[aei].availible = true;

          this.floors[i_row].btnText = "Call";
          this.elevators[aei].color = "black";
        }, 200);

        return console.log("elevator was on the floor");
      }

      //Elevator is moving ...⏫⏫

      const elevator = this.elevators[aei];
      // this.toggleTimer(aei);
      this.elevatorsOrder = this.elevatorsOrder.filter((o) => o != String(aei));
      this.elevatorsOrder.push(aei);
      // elevator.interval = setInterval(function () {
      //   if (!elevator.timeCount) elevator.timeCount = 0;
      //   elevator.timeCount++;
      // }, 100);
      elevator.availible = false;
      elevator.color = "red";
      // elevator.orders.push(orderTime);
      // elevator.orderTime = orderTime;

      if (this.schedule[orderTime]) {
        this.schedule[orderTime].elevator = aei;

        this.schedule[orderTime].status = "waiting";
      }
      elevator.floor = this.floors.length - 1 - i_row;

      elevator.marginTop =
        -1 * (this.floors.length - 1 - i_row) * 53 + startMargin;

      await setTimeout(() => {
        this.floors[i_row].btnText = "Arrived";

        elevator.color = "green";
        clearInterval(elevator.interval);
        elevator.interval = null;
        return this.onArrive(i_row, elevator, orderTime, aei);
      }, 6000);
    },
    playSound(
      sound = "http://soundbible.com/mp3/Elevator Ding-SoundBible.com-685385892.mp3"
    ) {
      if (sound) {
        var audio = new Audio(sound);
        audio.volume = 0.2;
        audio.play();
      }
    },
    async onArrive(i_row, elevator, orderTime, aei) {
      this.playSound();
      clearInterval(this.schedule[orderTime].interval);

      await setTimeout(() => {
        // this.callElevator(i_row);
        console.log({ aei });
        let queues = Object.values(this.schedule).filter(
          (s) => s.status == "queue"
        );

        this.floors[i_row].btnText = "Call";

        elevator.color = "black";
        elevator.availible = true;
        // elevator.timeCount = 0;
        // elevator.orders = elevator.orders.filter((ot) => ot != orderTime);
        this.schedule[orderTime].status = "end";
        if (queues.length)
          return this.callElevator(queues[0].floor, queues[0].orderTime);
      }, 2000);
    },
    floorText(i_row, i_col) {
      if (i_col != 1) return "";
      if (i_row == this.floorsLength) return "Ground Floor";
      return `${this.floorsLength - i_row}th`;
    },
    tdStyle(i_col) {
      if (i_col == 7) {
        return "border:0px";
      } else if (i_col == 1) {
        return "border:0px;text-align:end;padding-right:8px";
      } else return "vertical-align:bottom";
    },
  },

  props: {
    msg: String,
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  /* margin: 40px 0 0; */
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  /* margin: 0 20px; */
}
a {
  color: #42b983;
}

.my-icon {
  position: absolute;
  text-align: center;
  width: 20px;
  height: 20px;
  transition: margin 6000ms ease-out;
  /* transition-timing-function: cubic-bezier(0.42, 0, 0.2, 1); */
  display: inline-block;
  margin-top: 0px;
  margin-left: -9px;
}

td {
  width: 10vw;
  /* max-width: 180px;  */
  /* vertical-align: bottom; */
  text-align: center;
  /* margin: 0; */
}
td,
tr {
  height: 50px;
}
table,
td,
tr,
th {
  border: 0.5px solid lightgray;
}
table {
  font-size: 1vw !important;
  border-collapse: collapse;
}
table.center {
  margin-left: auto;
  margin-right: auto;
}
/* svg {
  fill: rgb(0, 0, 0);
} */
.stroke-red,
.stroke-red[path] {
  stroke: tomato;
  color: tomato;
  fill: tomato;
}
.el-button--mini {
  /* font-size: 1vw !important; */
  /* padding: 1vw !important; */
  min-height: unset !important;
}
.p-abs {
  margin-top: -10px;
  margin-left: -8px;
  font-size: 0.8vw;
  position: absolute;
}
</style>

