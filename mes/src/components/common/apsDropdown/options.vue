<template>
	<li
		@click="liClick(item)">
		1
	</li>
</template>

<script>
export default{
	name: 'apsOption',
	
	methods: {
		liClick: function(node){
			console.log("a");
		}
	}
}
</script>