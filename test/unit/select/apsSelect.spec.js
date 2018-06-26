/**
 * Created by linzx on 2018/6/20.
 */
'use strict'
import { expect } from 'chai'
import { shallowMount, mount } from '@vue/test-utils'
import apsSelect from '@/components/apsSelect/apsSelect.vue'
import apsOption from '@/components/apsSelect/option.vue'

describe ('apsSelect.vue', () => {
    const wrapper = mount(apsSelect,{
        propsData: {
            data: [{id:'1', label: '1'},{id:'2', label: '2'}],
            value: '1'
        },
        slots: {
            default: [apsOption],
        }
    })

    it("select下拉框DOM渲染成功", () => {
        expect(wrapper.contains(".aps-dropdown")).to.be.true
    })

    it("select传递props,并且渲染li成功", () => {
        expect(wrapper.contains(".aps-option-li")).to.be.true
    })
})