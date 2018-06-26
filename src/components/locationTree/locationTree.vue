<template>
    <ul>
        <li v-for="folder in currentFolder.children">
            <i></i>
          <span  ng-class="{'title-open' : folder.children}" class="tree-item ml-10"><s ng-show="folder.children" class="open-btn mr-10"></s>{{folder.name}}</span>
        </li>
    </ul>
</template>

<script>
    export default {
    	  name : "locationTree",
        prop : ["locationTreeData"],

    }
</script>
<style rel="stylesheet/scss" lang="scss">

</style>
