/**
 * Created by linzx on 2018/6/25.
 */
'use strict'
import { expect } from 'chai'
import { shallowMount, mount } from '@vue/test-utils'
import transfer from '@/components/transfer/transfer.vue'
import transferPanel from '@/components/transfer/transferPanel.vue'

describe ('transfer.vue', () => {
    const wrapper = mount(transfer,{
        propsData: {
            data: [{value:'1', label: '1'},{value:'2', label: '2',disabled : true},{value:'3', label: '3',isSelected: true},{value:'4', label: '4'}],
            value: ['3'],
            filterable: true
        },
        slots: {
            default: [transferPanel],
        }
    })

    it("transfer面板渲染", () => {
        expect(wrapper.find(".aps-transfer-input").exists()).to.be.true
    })

    it("transfer面板内的选项渲染并且文案渲染正确", () => {
        expect(wrapper.findAll(".aps-transfer-panel-body li").length).to.equal(4)
        expect(wrapper.find(".aps-transfer-panel-body li").text()).to.equal("1")
        expect(wrapper.find(".aps-transfer-panel.select-item li").text()).to.equal("3")
    })

    it("transfer面板内的选项设置为disable", () => {
        expect(wrapper.find(".aps-transfer-panel-body li.is-disabled").text()).to.equal("2")
    })

    it("transfer面板内的选项初始选中", () => {
        expect(wrapper.find(".aps-transfer-panel-body input[name='2']").element.value).to.equal("on")
    })

    it("transfer左侧面板全选", () => {
        wrapper.find(".all-item .aps-transfer-panel-footer .input-checkbox input").setChecked()
        expect(wrapper.findAll(".all-item .aps-transfer-panel-body .input-checkbox input:checked").length).to.equal(2)
    })

    it("transfer选中左侧选项移动到右侧", () => {
        wrapper.findAll(".aps-button-primary").at(1).trigger('click')

        console.log(wrapper.findAll(".all-item .aps-transfer-panel-body .input-checkbox input:checked").length)
        console.log(wrapper.findAll(".all-item .aps-transfer-panel-body .input-checkbox").length)

        expect(wrapper.findAll(".all-item .aps-transfer-panel-body .input-checkbox").length).to.equal(1)
        expect(wrapper.findAll(".select-item .aps-transfer-panel-body .input-checkbox").length).to.equal(3)
    })

})
