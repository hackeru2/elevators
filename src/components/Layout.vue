<template>
  <div>
    <pre>
    <span
      class="p-abs"
      style="left: 4px; top: 4px; width: 100px; font-size: 10px"
    >
      <br />
      <span  style="font-size: 20px"> queue -> {{ queue }} </span>
      <br />
      <span  style="font-size: 10px"> schedule -> {{ schedule }} </span>
      <!-- {{ elevators }} -->
      <!-- {{ floors }} -->
    </span>
</pre>
    <table class="center">
      <tr v-for="(floor, i_row) in floors" :key="i_row">
        <td v-for="i_col in 7" :key="i_col" :style="tdStyle(i_col)">
          <strong
            v-if="
              1 == 2 &&
              floor.btnText == 'waiting' &&
              ![1, 7].includes(i_col) &&
              floor.elevator.includes(String(i_col))
            "
            >{{ floor.elevator }},
            {{ floor.elevator.includes(String(i_col)) }} , {{ i_col }}</strong
          >
          <span type="success" size="mini" v-if="i_col == 1">
            {{ floorText(i_row) }}</span
          >

          <el-button
            @click="onClickCall(i_row)"
            :disabled="floor.btnText != 'Call'"
            :type="floor.btnText == 'waiting' ? 'danger' : 'success'"
            size="mini"
            v-else-if="i_col == 7"
            >{{ floor.btnText }}</el-button
          >
          <SomeIcon
            v-else-if="i_row == floors.length - 1 && i_col != 1"
            class="my-icon"
            :color="elevators[i_col].color"
            :style="`margin-top:${elevators[i_col].marginTop}px`"
          />
          <b
            style="line-height: 1vw"
            class="p-abs"
            v-if="
              elevators[i_col] && elevators[i_col].floor == floorsLength - i_row
            "
          >
            <!-- {{ elevators[i_col].floor }} -->
            <strong>
              <br />
              {{ elevators[i_col].timeCount }}
            </strong>
          </b>
        </td>
      </tr>
    </table>
  </div>
</template>

<script>
import SomeIcon from "../assets/SomeIcon";

export default {
  components: { SomeIcon },
  data() {
    let elevators = {};
    for (let i = 2; i <= 6; i++) {
      elevators[i] = {
        marginTop: -11,
        availible: true,
        floor: 0,
        orders: [],
        timeCount: null,
        interval: null,
      };
    }

    let floors = new Array(10).fill(1).map(() => {
      return { btnText: "Call", elevator: [] };
    });

    return {
      floors,
      elevators,
      time: 0,
      schedule: {},
      isRunning: false,
      elevatorsOrder: [],
      queue: [],
    };
  },
  name: "Layout",
  computed: {
    minOrderTime() {
      try {
        let ov = Object.values(this.schedule)
          .filter((o) => !o.assigned)
          .map((o) => o.orderTime);
        ov = Math.min(...ov);
        return ov;
      } catch (error) {
        return false;
      }
    },
    floorsLength() {
      return this.floors.length - 1;
    },
  },
  methods: {
    isElevatorOnTheFloor(i_row) {
      for (let key in this.elevators) {
        let values = this.elevators[key];

        if (values.floor == this.floorsLength - i_row && values.availible)
          throw key;
      }
    },
    pushToQueue(i_row, orderTime) {
      const { queue, schedule, minOrderTime, elevators } = this;

      // if (!this.queue.includes(i_row)) {
      queue.push(i_row);

      if (!orderTime) return;
      let aei = schedule[minOrderTime].elevator;
      schedule[orderTime].status = "queue";
      schedule[orderTime].elevator = aei;
      elevators[aei].orders.push(orderTime);
      schedule[minOrderTime].assigned = true;
      console.log({ schedule_minOrderTime: schedule[minOrderTime] });
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
        console.log({ nextDistanceCheck });
        if (distance > nextDistanceCheck) {
          distance = nextDistanceCheck;
          closestKey = ae[0];
        }
      });
      console.log({ distance, closestKey });
      return closestKey;
      // for (let key in this.elevators) {
      //   let values = this.elevators[key];

      //     let nextDistanceCheck = Math.abs(this.floorsLength - i_row - values.floor)

      // }
    },
    toggleTimer(aei) {
      let _this = this;
      this.elevators[aei].interval = setInterval(
        () => _this.incrementTime(aei),
        100
      );

      //debugger
    },
    incrementTime(aei) {
      if (!this.elevators[aei].timeCount) this.elevators[aei].timeCount = 0;
      this.elevators[aei].timeCount =
        parseInt(this.elevators[aei].timeCount) + 1;
    },
    onClickCall(i_row) {
      let orderTime = new Date().getTime();
      this.schedule[orderTime] = { floor: i_row, orderTime };
      this.callElevator(i_row, orderTime);
    },
    async callElevator(i_row, orderTime = "") {
      this.floors[i_row].btnText = "waiting";

      let aei; //availableElevatorIndex
      try {
        aei = this.findAvailableElev(i_row);
      } catch (error) {
        // console.log(error);
        return this.pushToQueue(i_row, orderTime);
      }
      // console.log({ aei });

      try {
        this.isElevatorOnTheFloor(i_row);
      } catch (key) {
        delete this.schedule[orderTime];
        aei = key;
        this.elevators[aei].color = "green";
        setTimeout(() => {
          this.elevators[aei].availible = true;

          this.floors[i_row].btnText = "Call";
          this.elevators[aei].color = "black";
        }, 200);

        return console.log("elevator was on the floor");
      }

      //Elevator is moving ...⏫

      const elevator = this.elevators[aei];
      // this.toggleTimer(aei);
      this.elevatorsOrder = this.elevatorsOrder.filter((o) => o != String(aei));
      this.elevatorsOrder.push(aei);
      elevator.interval = setInterval(function () {
        if (!elevator.timeCount) elevator.timeCount = 0;
        elevator.timeCount++;
      }, 100);
      elevator.availible = false;
      elevator.color = "red";
      // elevator.orderTime = orderTime;

      if (this.schedule[orderTime]) {
        this.schedule[orderTime].elevator = aei;
        this.schedule[orderTime].status = "waiting";
      }
      elevator.floor = this.floors.length - 1 - i_row;
      this.floors[elevator.floor].elevator.push(aei);
      elevator.marginTop = -1 * (this.floors.length - 1 - i_row) * 53 - 11;

      await setTimeout(() => {
        this.floors[i_row].btnText = "Arrived";

        elevator.color = "green";
        clearInterval(elevator.interval);
        elevator.interval = null;
        return this.onArrive(i_row, elevator, orderTime);
      }, 6000);
    },
    playSound(
      sound = "http://soundbible.com/mp3/Elevator Ding-SoundBible.com-685385892.mp3"
    ) {
      if (sound) {
        var audio = new Audio(sound);
        audio.play();
      }
    },
    async onArrive(i_row, elevator, orderTime) {
      if (this.schedule[orderTime]) this.schedule[orderTime].status = "arrived";
      this.playSound();

      await setTimeout(() => {
        if (this.queue.length) {
          let queueNum = this.queue[0];
          this.queue.shift();
          this.callElevator(queueNum);
        }

        this.floors[i_row].btnText = "Call";

        elevator.color = "black";
        elevator.availible = true;
        elevator.timeCount = 0;
        elevator.orders = elevator.orders.filter((ot) => ot != orderTime);
        delete this.schedule[orderTime];
      }, 2000);
    },
    floorText(i_row) {
      if (i_row == this.floorsLength) return "Ground Floor";
      return `${this.floorsLength - i_row}th`;
    },
    tdStyle(i_col) {
      if (i_col == 7) {
        return "border:0px";
      } else if (i_col == 1) {
        return "border:0px;text-align:end;padding-right:8px";
      }
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

  margin: 0;
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
  position: absolute;
}
</style>

