<template>
	<div class="hello">
		<h1>{{text}}</h1>
		<!--displays list -->
		<ul>
			<li v-for="item in listItems">{{ item }}</li>
		</ul>
		<span>{{count}}</span>
		<button @click="add">+++</button>
	</div>
</template>

<script>
    export default {
        name: 'list',
        data () {
            return {
                text: 'My To Do List',
                listItems: ['buy food', 'play games', 'sleep'],
				count: 0
            }
        },
		methods: {
            add(){
                this.count ++
			}
		}
    }
</script>