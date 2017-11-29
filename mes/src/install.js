import apsCascader from "./components/common/cascader/cascader.vue";
import apsTable from "./components/common/table/table.vue";
import apsDropdown from "./components/common/apsDropdown/apsDropdown.vue";
import apsOptionGroup from "./components/common/apsDropdown/optionGroup.vue";
import apsOption from "./components/common/apsDropdown/option.vue";
import apsTransfer from "./components/common/transfer/transfer.vue"
import apsQueryConditionBox from "./components/common/queryConditionBox/queryConditionBox.vue"

import locationCascader from "./components/common/locationCascader.vue"
import addScheme from "./components/common/addScheme.vue"
import dateSelect from "./components/common/dateSelect.vue";
import colConfig from "./components/common/colConfig.vue";
import exportExcel from "./components/common/exportExcel.vue";
import printTable from "./components/common/printTable.vue";

const components = [
	apsCascader,
	apsDropdown,
	apsTable,
	apsOptionGroup,
	apsOption,
	apsTransfer,
	apsQueryConditionBox,

  locationCascader,
  addScheme,
	dateSelect,
	colConfig,
	exportExcel,
	printTable,
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
