<script setup lang="ts">
import { reactive, ref } from "vue";
import chessboard from "../chessboard";
import chesspieces from "../chesspieces";

let tableRow: Number[] = [1, 2, 3, 4, 5, 6, 7, 8];
let tableColumn: String[] = ["a", "b", "c", "d", "e", "f", "g", "h"];

let destroyedPiece: {}[] = [];

let newChessBoard = reactive(chessboard);
let newChessPieces = reactive(chesspieces);

let step = ref<string>("first");
let currentPiece = ref<any>(undefined);

function checkTeamStep(thisPiece: any): boolean {
  if (thisPiece.team == step.value) {
    return true;
  } else {
    return false;
  }
}

function checkTeamOnField(field: string): string {
  let team: string | null = null;

  for (const i of newChessPieces) {
    if (i.position === field) {
      team = i.team;
    }
  }

  return team!;
}

function getPieceOnField(field: string) {
  let piece: {} | null = null;

  for (const i of newChessPieces) {
    if (i.position === field) {
      piece = i;
    }
  }

  return piece!;
}

function checkFreedomFields(field: string): boolean {
  let freeness: boolean = true;

  for (const i of newChessPieces) {
    if (i.position === field) {
      freeness = false;
    }
  }

  return freeness;
}

function checkAvailableFields(
  thisPiece: any,
  type: string
): String[] | undefined {
  if (type === `move`) {
    if (thisPiece.level == 1) {
      let indexOfTableColumn: number = tableColumn.indexOf(
        thisPiece.position[0]
      );
      let availableColumnLeft: String = tableColumn[indexOfTableColumn - 1];
      let availableColumnRight: String = tableColumn[indexOfTableColumn + 1];
      let availableRow: number;

      if (thisPiece.team == "first") {
        availableRow = Number(thisPiece.position[1]) - 1;

        let availableField: String[] = [
          `${availableColumnLeft + availableRow.toString()}`,
          `${availableColumnRight + availableRow.toString()}`,
        ];

        return availableField;
      }
      if (thisPiece.team == "second") {
        availableRow = Number(thisPiece.position[1]) + 1;

        let availableField: String[] = [
          `${availableColumnLeft + availableRow.toString()}`,
          `${availableColumnRight + availableRow.toString()}`,
        ];

        return availableField;
      }
    }
  } else if (type === "capture") {
    if (thisPiece.level == 1) {
      let indexOfTableColumn: number = tableColumn.indexOf(
        thisPiece.position[0]
      );
      let availableColumnLeft: String = tableColumn[indexOfTableColumn - 2];
      let availableColumnRight: String = tableColumn[indexOfTableColumn + 2];
      let availableRow: number;

      if (thisPiece.team == "first") {
        availableRow = Number(thisPiece.position[1]) - 2;

        let availableField: String[] = [
          `${availableColumnLeft + availableRow.toString()}`,
          `${availableColumnRight + availableRow.toString()}`,
        ];

        return availableField;
      }
      if (thisPiece.team == "second") {
        availableRow = Number(thisPiece.position[1]) + 2;

        let availableField: String[] = [
          `${availableColumnLeft + availableRow.toString()}`,
          `${availableColumnRight + availableRow.toString()}`,
        ];

        return availableField;
      }
    }
  }
}

function moves(event: {}, field: any): void {
  if (currentPiece) {
    if (checkTeamStep(currentPiece)) {
      if (checkAvailableFields(currentPiece, "move")) {
        for (const i of checkAvailableFields(currentPiece, "move") || []) {
          let checkAvailability = newChessPieces.find(
            (data) => data.position == field.field
          );
          if (i == field.field && checkAvailability == undefined) {
            currentPiece.position = i;
            if (step.value === "first") {
              step.value = "second";
            } else {
              step.value = "first";
            }
          }
        }
      }
    }
  }
}

function capture(event: {}, field: any): void {
  if (currentPiece) {
    let firstPosition = currentPiece.position;
    if (checkTeamStep(currentPiece)) {
      if (checkAvailableFields(currentPiece, "capture")) {
        for (const i of checkAvailableFields(currentPiece, "capture") || []) {
          let checkAvailability = newChessPieces.find(
            (data) => data.position == field.field
          );

          let enemyRow: number = (Number(firstPosition[1]) + Number(i[1])) / 2;
          let enemyColumn: String =
            tableColumn[
              (tableColumn.indexOf(firstPosition[0]) +
                tableColumn.indexOf(i[0])) /
                2
            ];

          let enemyPosition: string = `${enemyColumn}${enemyRow}`;
          let enemyPiece: {} = getPieceOnField(enemyPosition);
          let enemyIndex: number = newChessPieces
            .map((data) => data.position)
            .indexOf(enemyPosition);

          if (!checkFreedomFields(enemyPosition)) {
            if (checkTeamOnField(enemyPosition) !== currentPiece.team) {
              if (i == field.field && checkAvailability == undefined) {
                currentPiece.position = i;

                newChessPieces.splice(enemyIndex, 1);

                destroyedPiece.push(enemyPiece);

                if (step.value === "first") {
                  step.value = "second";
                } else {
                  step.value = "first";
                }
              }
            }
          }
        }
      }
    }
  }
}

function selectPiece(event: {}, piece: any): void {
  currentPiece = piece;
}
</script>

<template>
  <div class="chessboard">
    <div
      class="chessboard__field"
      v-for="field of newChessBoard"
      :key="field.field"
      :style="{ backgroundColor: field.color }"
      @dragover.prevent
      @drop="moves($event, field), capture($event, field)"
    >
      <template v-for="piece of newChessPieces" :key="piece.position">
        <div
          class="piece"
          v-if="field.field == piece.position"
          :style="{ backgroundColor: piece.color }"
          @dragstart="selectPiece($event, piece)"
          draggable="true"
        ></div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.chessboard {
  box-sizing: content-box;
  margin: 0 auto;
  margin-top: 100px;
  width: 435px;
  height: 435px;
  display: flex;
  flex-wrap: wrap;
  padding: 5px;
  outline: 25px rgb(230, 214, 174) solid;
}
.chessboard__field {
  width: 50px;
  height: 50px;
  position: relative;
  background-color: white;
}
.piece {
  position: absolute;
  margin-top: 50%;
  margin-left: 50%;
  transform: translate(-50%, -50%);
  height: 40px;
  width: 40px;
  border-radius: 50%;
}
.chessboard__field:not(:nth-child(8n)) {
  margin-right: 5px;
}
.chessboard__field:not(:nth-child(n + 56)) {
  margin-bottom: 5px;
}
</style>
