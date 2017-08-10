import apsCascader from "./components/common/cascader/cascader.vue";
import apsTable from "./components/common/table/table.vue";
import apsDropdown from "./components/common/apsDropdown/apsDropdown.vue";
import apsOptionGroup from "./components/common/apsDropdown/optionGroup.vue";
import apsOption from "./components/common/apsDropdown/option.vue";

const components = [
	apsCascader,
	apsDropdown,
	apsTable,
	apsOptionGroup,
	apsOption
];

const install = function (Vue, opts = {}) {
	/* istanbul ignore if */
	if (install.installed) return;

	components.map(component => {
		Vue.component(component.name, component);
	});
};

/* istanbul ignore if */
if (typeof window !== 'undefined' && window.Vue) {
	install(window.Vue);
};

export default install
