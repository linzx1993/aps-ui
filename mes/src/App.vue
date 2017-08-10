<template>
    <div id="app">
        <router-view></router-view>
    </div>
</template>

<script>
export default {
	name: 'app',
	data() {
		return {
		  input: '',
		  router: true
		}
  	},
	methods : {
		handleOpen(key, keyPath) {
		  	console.log(key, keyPath);
		},
		handleClose(key, keyPath) {
		  	console.log(key, keyPath);
		}
	}
}
</script>

<style>
</style>
