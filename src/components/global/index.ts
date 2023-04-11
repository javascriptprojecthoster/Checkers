import chessTable from "../chessTable.vue";

const components = [{ name: "chessTable", component: chessTable }];

export default {
  install(app: any) {
    components.forEach(({ name, component }) => {
      app.component(name, component);
    });
  },
};
