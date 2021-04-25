<template>
  <div>
    <span class="p-abs" style="left: 4px; top: 4px"
      >Time to Arrive:{{ time }}
      <br />
      <span> queue -> {{ queue }} </span></span
    >

    <table class="center">
      <tr v-for="(floor, i_row) in floors" :key="i_row">
        <td v-for="i_col in 7" :key="i_col" :style="tdStyle(i_col)">
          <span type="success" size="mini" v-if="i_col == 1">
            {{ floorText(i_row) }}</span
          >

          <el-button
            @click="callElevator(i_row)"
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
        class: "",
        availible: true,
        floor: 0,
      };
    }

    let floors = new Array(10).fill(1).map(() => {
      return { btnText: "Call" };
    });

    return {
      floors,
      elevators,
      time: 0,
      isRunning: false,
      interval: "",
      queue: [],
    };
  },
  name: "Layout",
  computed: {
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
    pushToQueue(i_row) {
      this.queue.push(i_row);
    },
    findAvailableElev(i_row) {
      for (let key in this.elevators) {
        let values = this.elevators[key];
        console.log(
          "distance",
          Math.abs(this.floorsLength - i_row - values.floor)
        );
        if (values.availible) return key;
      }
      throw "all Occupied";
    },
    toggleTimer() {
      return console.log("dfg");
      // this.interval = setInterval(this.incrementTime, 1);
      // if (this.isRunning) {
      //   //debugger
      //   clearInterval(this.interval);
      //   console.log("timer stops");
      // } else {
      //   console.log("timer starts");
      // }
      // this.isRunning = this.isRunning ? false : true;
    },
    incrementTime() {
      this.time = parseInt(this.time) + 1;
    },

    async callElevator(i_row) {
      this.floors[i_row].btnText = "waiting";
      this.toggleTimer();
      let aei; //availableElevatorIndex
      try {
        aei = this.findAvailableElev(i_row);
      } catch (error) {
        console.log(error);
        return this.pushToQueue(i_row);
      }
      console.log({ aei });

      // this.floors[i_row].disabled = true;

      try {
        this.isElevatorOnTheFloor(i_row);
      } catch (key) {
        // alert(key);
        aei = key;
        this.elevators[aei].color = "green";
        setTimeout(() => {
          this.elevators[aei].availible = true;
          // this.floors[i_row].disabled = false;
          this.floors[i_row].btnText = "Call";
          this.elevators[aei].color = "black";
        }, 1000);

        return console.log("elevator was on the floor");
      }
      this.elevators[aei].availible = false;
      this.elevators[aei].color = "red";
      this.elevators[aei].floor = this.floors.length - 1 - i_row;
      this.elevators[aei].marginTop =
        -1 * (this.floors.length - 1 - i_row) * 53 - 11;

      await setTimeout(() => {
        this.floors[i_row].btnText = "Arrived";
        clearInterval(this.interval);
        // this.isRunning = false;
        this.elevators[aei].color = "green";
        return this.onArrive(i_row, aei);
      }, 6000);
    },
    async onArrive(i_row, aei) {
      await setTimeout(() => {
        if (this.queue.length) {
          let queueNum = this.queue[0];
          this.queue.shift();
          this.callElevator(queueNum);
        }
        this.floors[i_row].btnText = "Call";
        // this.floors[i_row].disabled = false;
        this.elevators[aei].color = "black";
        this.elevators[aei].availible = true;
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
  transition: margin 6000ms ease;
  transition-timing-function: cubic-bezier(0.42, 0, 0.2, 1);
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

