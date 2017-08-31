import apsCascader from "./components/common/cascader/cascader.vue";
import apsTable from "./components/common/table/table.vue";
import apsDropdown from "./components/common/apsDropdown/apsDropdown.vue";
import apsOptionGroup from "./components/common/apsDropdown/optionGroup.vue";
import apsOption from "./components/common/apsDropdown/option.vue";

import dateSelect from "./components/common/dateSelect.vue";
import colConfig from "./components/common/colConfig.vue";

const components = [
	apsCascader,
	apsDropdown,
	apsTable,
	apsOptionGroup,
	apsOption,
	dateSelect,
	colConfig
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
