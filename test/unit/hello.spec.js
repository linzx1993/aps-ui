/**
 * Created by linzx on 2018/6/19.
 */
'use strict'
import Vue from "Vue"
import hello from "@/components/hello.vue"
import { expect } from 'chai'
import { shallowMount } from '@vue/test-utils'

describe('hello.vue', () => {
    const wrapper = shallowMount(hello)
    it('text文案渲染成功', () => {
        expect(wrapper.find('.hello h1').text()).contains('My To Do List')
    })

    it('添加count点击事件成功', () => {
        wrapper.find('button').trigger('click')
        expect(wrapper.find('div').text()).contains('1')
    })

    it('v-for循环性渲染成功', () => {
        const Constructor = Vue.extend(hello)
        const vm = new Constructor().$mount()
        expect(vm.$el.querySelector('ul').textContent)
            .to.contain('play games')
    })
})