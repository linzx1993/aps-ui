<template>
	<ul class="aps-select-group">
		<li class="aps-select-group-title">
			{{label}}
		</li>
		<li>
			<ul class="aps-select-group-member">
				<slot></slot>
			</ul>
		</li>
	</ul>
</template>

<script>

export default{
	
	name: 'apsOptionGroup',

    componentName: 'apsOptionGroup',
	
	props: {
		label: [String, Number]
	},
}

</script>