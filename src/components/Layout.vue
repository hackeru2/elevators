<template>
  <div>
    <el-button type="primary" class="reset-btn" @click="$emit('reset')"
      >Reset</el-button
    >
    <table>
      <tr v-for="(floor, i_row) in floors" :key="i_row">
        <td v-for="i_col in columns" :key="i_col" :style="tdStyle(i_col)">
          <strong class="p-abs"> {{ printTime(i_col, i_row) }} </strong>
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
  props: ["form"],
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
    for (let i = 2; i <= this.elevatorsNumber + 1; i++) {
      this.elevators[i] = {
        marginTop: startMargin,
        availible: true,
        floor: 0,
      };
    }

    this.floors = new Array(this.floorsNumber).fill(1).map(() => {
      return { btnText: "Call" };
    });
  },
  computed: {
    floorsNumber() {
      try {
        if (!this.form.floors) throw "empty";
        return this.form.floors;
      } catch (error) {
        return 10;
      }
    },
    elevatorsNumber() {
      try {
        if (!this.form.elevators) throw "empty";
        return this.form.elevators;
      } catch (error) {
        return 5;
      }
    },
    scheduledLength() {
      return Object.keys(this.schedule).length;
    },
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
    floorsLength() {
      return this.floors.length - 1;
    },
  },
  watch: {
    scheduledLength() {
      let keys = Object.values(this.schedule)
        .filter((s) => s.status == "end")
        .map((s) => s.orderTime);
      keys.forEach((k) => delete this.schedule[k]);
    },
  },
  methods: {
    assignElevator() {
      let entries = Object.entries(this.elevators);

      console.log({ entries });
    },
    printTime(i_col, i_row) {
      if ([1, this.columns].includes(i_col)) return "";
      let scheduleOrder = Object.values(this.schedule).find(
        (s) =>
          s.time && s.floor == i_row && s.elevator == i_col && s.status != "end"
      );
      if (scheduleOrder) return (scheduleOrder.time / 10).toFixed(1) + "Sec";
    },
    isElevatorOnTheFloor(i_row) {
      for (let key in this.elevators) {
        let values = this.elevators[key];

        if (values.floor == this.floorsLength - i_row && values.availible)
          throw key;
      }
    },

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
        this.schedule[this.nextElevatorSchedule.orderTime].assigned = true;

        return;
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
          delete this.schedule[orderTime];
          this.floors[i_row].btnText = "Call";
          this.elevators[aei].color = "black";
        }, 200);

        return console.log("elevator was on the floor");
      }

      //Elevator is moving ...⏫⏫

      const elevator = this.elevators[aei];
      elevator.availible = false;
      elevator.color = "red";

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

    playSound() {
      var audio = new Audio(
        "http://soundbible.com/mp3/Elevator Ding-SoundBible.com-685385892.mp3"
      );
      audio.volume = 0.2;
      audio.play();
    },

    async onArrive(i_row, elevator, orderTime, aei) {
      this.playSound();
      clearInterval(this.schedule[orderTime].interval);

      await setTimeout(() => {
        console.log({ aei });
        let queues = Object.values(this.schedule).filter(
          (s) => s.status == "queue"
        );

        this.floors[i_row].btnText = "Call";

        elevator.color = "black";
        elevator.availible = true;

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
      if (i_col == this.columns) {
        return "border:0px;background-color:lightgray";
      } else if (i_col == 1) {
        return "font-size:12px;text-align:end;padding-right:8px;background-color:lightgray;font-weight:700";
      } else return "vertical-align:bottom;background-color:white";
    },
  },
  beforeUnmount() {
    this.floors = [];
    this.elevators = {};
    this.schedule = {};
  },
};
</script>
 
<style scoped>
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
  text-align: center;
}
td,
tr {
  height: 50px;
}
table,
td,
tr,
th {
  border: 0.5px solid lightgray !important;
}
table {
  font-size: 1vw !important;
  border-collapse: collapse !important;
  margin-left: auto;
  margin-right: auto;
}

.el-button--mini {
  font-weight: 700;
  min-height: unset !important;
  font-size: 10px !important;
  min-width: 62px;
}
.p-abs {
  margin-top: -10px;
  margin-left: -8px;
  font-size: 8px;
  position: absolute;
}
.reset-btn {
  position: absolute;
  right: 8px;
  top: 8px;
  padding: 15px;
}
.el-button--danger.is-disabled {
  background-color: red !important;
}
</style>

