import Vue from "vue";
import domPortal from "./domPortal";

const directive = [
  { name: "domPortal", content: domPortal }
];
directive.map(directive => {
  Vue.directive(directive.name, directive.content);
});